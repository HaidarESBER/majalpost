import { Router, Response } from 'express';
import mongoose from 'mongoose';
import { Media } from '../models/Media.js';
import { ApiResponse } from '../types/index.js';
import { ApiError, HttpStatus } from '../types/index.js';
import { uploadImage } from '../middleware/upload.js';
import { validateImage, getImageDimensions } from '../utils/imageProcessor.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { uploadLimiter } from '../middleware/rateLimit.js';
import { validateObjectId } from '../utils/validation.js';
import { uploadToCloudinary, getThumbnailUrl, deleteFromCloudinary } from '../utils/cloudinary.js';

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
      fileUrl: (item as any).url || `/api/media/${item._id}/file`,
      thumbnailUrl: (item as any).thumbnailUrl || `/api/media/${item._id}/thumbnail`,
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

    // Validate image (file.buffer is available when using memory storage)
    if (!file.buffer) {
      throw new ApiError('File buffer is missing', HttpStatus.BAD_REQUEST);
    }

    const validation = await validateImage(file.buffer, file.mimetype);
    if (!validation.valid) {
      throw new ApiError(validation.error || 'Invalid image file', HttpStatus.BAD_REQUEST);
    }

    // Get image dimensions
    const dimensions = await getImageDimensions(file.buffer);

    // Upload original image to Cloudinary
    const uploadResult = await uploadToCloudinary(file.buffer, 'majalpost/images');

    // Generate thumbnail URL (Cloudinary generates it on-the-fly)
    const thumbnailUrl = getThumbnailUrl(uploadResult.public_id, {
      width: 400,
      height: 400,
      quality: 80,
    });

    // Create media document
    const media = new Media({
      filename: file.originalname,
      cloudinaryPublicId: uploadResult.public_id,
      url: uploadResult.url,
      thumbnailUrl,
      mimeType: file.mimetype,
      size: uploadResult.bytes,
      width: uploadResult.width,
      height: uploadResult.height,
      uploadedBy: req.user?.userId ? new mongoose.Types.ObjectId(req.user.userId) : undefined,
    });

    await media.save();

    // Return media document with URLs
    const mediaObject = media.toObject() as unknown as Record<string, unknown>;
    const responseData = {
      ...mediaObject,
      fileUrl: media.url,
      thumbnailUrl: media.thumbnailUrl,
    };
    const response: ApiResponse<typeof responseData> = {
      success: true,
      data: responseData,
      message: 'Image uploaded successfully',
    };

    res.status(HttpStatus.CREATED).json(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`, HttpStatus.INTERNAL_SERVER_ERROR);
  }
});

/**
 * PUBLIC ROUTES (no authentication required)
 */

/**
 * Serve original file (public) - Redirects to Cloudinary URL
 * GET /api/media/:id/file
 * IMPORTANT: This route must come before /:id to ensure proper matching
 */
router.get('/:id/file', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    const mediaId = Array.isArray(id) ? id[0] : id;
    validateObjectId(mediaId, 'Media ID');

    const media = await Media.findById(mediaId);

    if (!media) {
      throw new ApiError('Media not found', HttpStatus.NOT_FOUND);
    }

    // Use Cloudinary URL if available, otherwise fallback to legacy path
    if (media.url) {
      res.redirect(302, media.url);
      return;
    }

    // Legacy support - should not happen in new uploads
    throw new ApiError('File URL not available', HttpStatus.NOT_FOUND);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to serve file', HttpStatus.INTERNAL_SERVER_ERROR);
  }
});

/**
 * Serve thumbnail (public) - Redirects to Cloudinary thumbnail URL
 * GET /api/media/:id/thumbnail
 * IMPORTANT: This route must come before /:id to ensure proper matching
 */
router.get('/:id/thumbnail', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    const mediaId = Array.isArray(id) ? id[0] : id;
    validateObjectId(mediaId, 'Media ID');

    const media = await Media.findById(mediaId);

    if (!media) {
      throw new ApiError('Media not found', HttpStatus.NOT_FOUND);
    }

    // Use Cloudinary thumbnail URL if available
    if (media.thumbnailUrl) {
      res.redirect(302, media.thumbnailUrl);
      return;
    }

    // Fallback: generate thumbnail URL from public_id if available
    if (media.cloudinaryPublicId) {
      const thumbnailUrl = getThumbnailUrl(media.cloudinaryPublicId);
      res.redirect(302, thumbnailUrl);
      return;
    }

    // Legacy support - should not happen in new uploads
    throw new ApiError('Thumbnail URL not available', HttpStatus.NOT_FOUND);
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
    const mediaId = Array.isArray(id) ? id[0] : id;
    validateObjectId(mediaId, 'Media ID');

    const media = await Media.findById(mediaId).lean();

    if (!media) {
      throw new ApiError('Media not found', HttpStatus.NOT_FOUND);
    }

    const mediaObject = media as typeof media & {
      fileUrl: string;
      thumbnailUrl: string;
    };

    // Use Cloudinary URLs if available, otherwise use API endpoints
    mediaObject.fileUrl = (media as any).url || `/api/media/${mediaId}/file`;
    mediaObject.thumbnailUrl = (media as any).thumbnailUrl || `/api/media/${mediaId}/thumbnail`;

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
