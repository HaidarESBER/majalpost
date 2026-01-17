import { Router, Response } from 'express';
import path from 'path';
import fs from 'fs/promises';
import { Media } from '../models/Media.js';
import { ApiResponse } from '../types/index.js';
import { ApiError, HttpStatus } from '../types/index.js';
import { env } from '../config/env.js';
import { uploadImage } from '../middleware/upload.js';
import { generateThumbnail, validateImage, getImageDimensions } from '../utils/imageProcessor.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { uploadLimiter } from '../middleware/rateLimit.js';
import { validateObjectId } from '../utils/validation.js';
import { validateUploadPath } from '../utils/pathSecurity.js';

const router = Router();

/**
 * PROTECTED ROUTES (require authentication)
 * These must be registered first to avoid conflicts with /:id routes
 */

/**
 * List media (protected)
 * GET /api/media
 * Query params: ?page=1&limit=20&mimeType=image/jpeg
 */
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const { mimeType } = req.query;

    const filter: Record<string, unknown> = {};
    if (mimeType) {
      filter.mimeType = mimeType;
    }

    const skip = (page - 1) * limit;

    const [media, total] = await Promise.all([
      Media.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Media.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    const mediaWithUrls = media.map((item) => ({
      ...item,
      fileUrl: `/api/media/${item._id}/file`,
      thumbnailUrl: `/api/media/${item._id}/thumbnail`,
    }));

    const response: ApiResponse<{
      items: typeof mediaWithUrls;
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    }> = {
      success: true,
      data: {
        items: mediaWithUrls,
        pagination: {
          total,
          page,
          limit,
          totalPages,
        },
      },
    };

    res.json(response);
  } catch (error) {
    throw error;
  }
});

/**
 * Upload image (protected)
 * POST /api/media/upload
 * Form data: image (file)
 */
router.post('/upload', authenticate, uploadLimiter, uploadImage, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      throw new ApiError('No file uploaded', HttpStatus.BAD_REQUEST);
    }

    const file = req.file;
    const fileBuffer = await fs.readFile(file.path);

    // Validate image
    const validation = await validateImage(fileBuffer, file.mimetype);
    if (!validation.valid) {
      // Clean up uploaded file
      await fs.unlink(file.path).catch(() => {});
      throw new ApiError(validation.error || 'Invalid image file', HttpStatus.BAD_REQUEST);
    }

    // Get image dimensions
    const dimensions = await getImageDimensions(fileBuffer);

    // Generate thumbnail path
    const thumbnailFilename = `${path.basename(file.filename, path.extname(file.filename))}.jpg`;
    const thumbnailPath = path.join(env.THUMBNAIL_DIR, thumbnailFilename);

    // Generate thumbnail
    await generateThumbnail(fileBuffer, thumbnailPath);

    // Create media document
    const media = new Media({
      filename: file.originalname,
      originalPath: file.path,
      thumbnailPath,
      mimeType: file.mimetype,
      size: file.size,
      width: dimensions.width,
      height: dimensions.height,
    });

    await media.save();

    // Return media document with URLs (not paths)
    const mediaObject = media.toObject() as unknown as Record<string, unknown>;
    const responseData = {
      ...mediaObject,
      fileUrl: `/api/media/${media._id}/file`,
      thumbnailUrl: `/api/media/${media._id}/thumbnail`,
    };
    const response: ApiResponse<typeof responseData> = {
      success: true,
      data: responseData,
      message: 'Image uploaded successfully',
    };

    res.status(HttpStatus.CREATED).json(response);
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file?.path) {
      await fs.unlink(req.file.path).catch(() => {});
    }

    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to upload image', HttpStatus.INTERNAL_SERVER_ERROR);
  }
});

/**
 * PUBLIC ROUTES (no authentication required)
 */

/**
 * Serve original file (public)
 * GET /api/media/:id/file
 * IMPORTANT: This route must come before /:id to ensure proper matching
 */
router.get('/:id/file', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    validateObjectId(id, 'Media ID');

    const media = await Media.findById(id);

    if (!media) {
      throw new ApiError('Media not found', HttpStatus.NOT_FOUND);
    }

    // Validate and resolve file path
    const validatedPath = validateUploadPath(media.originalPath);

    // Check if file exists
    try {
      await fs.access(validatedPath);
    } catch {
      throw new ApiError('File not found on server', HttpStatus.NOT_FOUND);
    }

    // Serve file with appropriate headers
    res.setHeader('Content-Type', media.mimeType);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year cache
    res.sendFile(validatedPath);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to serve file', HttpStatus.INTERNAL_SERVER_ERROR);
  }
});

/**
 * Serve thumbnail (public)
 * GET /api/media/:id/thumbnail
 * IMPORTANT: This route must come before /:id to ensure proper matching
 */
router.get('/:id/thumbnail', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    validateObjectId(id, 'Media ID');

    const media = await Media.findById(id);

    if (!media) {
      throw new ApiError('Media not found', HttpStatus.NOT_FOUND);
    }

    // Check if thumbnail exists, fallback to original if not
    let filePath = media.thumbnailPath || media.originalPath;
    let fileExists = false;

    if (media.thumbnailPath) {
      try {
        const validatedThumbnailPath = validateUploadPath(media.thumbnailPath);
        await fs.access(validatedThumbnailPath);
        filePath = validatedThumbnailPath;
        fileExists = true;
      } catch {
        // Thumbnail doesn't exist, fallback to original
        filePath = media.originalPath;
      }
    }

    // Validate and resolve file path
    const validatedPath = validateUploadPath(filePath);

    // Check if file exists
    try {
      await fs.access(validatedPath);
    } catch {
      throw new ApiError('File not found on server', HttpStatus.NOT_FOUND);
    }

    // Serve file with appropriate headers
    res.setHeader('Content-Type', fileExists ? 'image/jpeg' : media.mimeType);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year cache
    res.sendFile(validatedPath);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to serve thumbnail', HttpStatus.INTERNAL_SERVER_ERROR);
  }
});

/**
 * Get media by ID (public)
 * GET /api/media/:id
 * IMPORTANT: This generic route must come last, after all specific routes
 */
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    validateObjectId(id, 'Media ID');

    const media = await Media.findById(id).lean();

    if (!media) {
      throw new ApiError('Media not found', HttpStatus.NOT_FOUND);
    }

    const mediaObject = media as typeof media & {
      fileUrl: string;
      thumbnailUrl: string;
    };

    mediaObject.fileUrl = `/api/media/${id}/file`;
    mediaObject.thumbnailUrl = `/api/media/${id}/thumbnail`;

    const response: ApiResponse<typeof mediaObject> = {
      success: true,
      data: mediaObject,
    };

    res.json(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw error;
  }
});

export default router;
