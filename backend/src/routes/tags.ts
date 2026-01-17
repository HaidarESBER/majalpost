import { Router, Request, Response } from 'express';
import { Tag } from '../models/Tag.js';
import { ApiResponse } from '../types/index.js';
import { ApiError, HttpStatus } from '../types/index.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { requireAdminOrEditor } from '../middleware/authorize.js';

const router = Router();

/**
 * Generate slug from name
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Get all tags
 * GET /api/tags
 * Query params: ?isActive=true (optional filter), ?search=term (optional search by name)
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { isActive, search } = req.query;
    const filter: Record<string, unknown> = {};
    
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    if (search && typeof search === 'string') {
      filter.name = { $regex: search, $options: 'i' };
    }

    const tags = await Tag.find(filter)
      .sort({ name: 1 })
      .lean();

    const response: ApiResponse<typeof tags> = {
      success: true,
      data: tags,
    };

    res.json(response);
  } catch (error) {
    throw error;
  }
});

/**
 * Get single tag by slug
 * GET /api/tags/:slug
 */
router.get('/:slug', async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;

    const tag = await Tag.findOne({ slug }).lean();

    if (!tag) {
      throw new ApiError('Tag not found', HttpStatus.NOT_FOUND);
    }

    const response: ApiResponse<typeof tag> = {
      success: true,
      data: tag,
    };

    res.json(response);
  } catch (error) {
    throw error;
  }
});

/**
 * PROTECTED ROUTES (require authentication and admin/editor role)
 */

/**
 * Create new tag
 * POST /api/tags
 */
router.post('/', authenticate, requireAdminOrEditor, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, slug, isActive } = req.body;

    // Validation
    if (!name) {
      throw new ApiError('Tag name is required', HttpStatus.BAD_REQUEST);
    }

    // Generate slug if not provided
    const finalSlug = slug || generateSlug(name);

    // Check for duplicate name or slug
    const existingTag = await Tag.findOne({
      $or: [{ name }, { slug: finalSlug }],
    });
    
    if (existingTag) {
      throw new ApiError('Tag with this name or slug already exists', HttpStatus.CONFLICT);
    }

    // Create tag
    const tag = new Tag({
      name,
      slug: finalSlug,
      isActive: isActive !== undefined ? isActive : true,
    });

    await tag.save();

    const response: ApiResponse = {
      success: true,
      data: tag.toObject() as unknown,
      message: 'Tag created successfully',
    };

    res.status(HttpStatus.CREATED).json(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Handle Mongoose validation errors
    if (error instanceof Error && error.name === 'ValidationError') {
      throw new ApiError(error.message, HttpStatus.BAD_REQUEST);
    }
    // Handle duplicate key errors
    if (error instanceof Error && (error as { code?: number }).code === 11000) {
      throw new ApiError('Tag with this name or slug already exists', HttpStatus.CONFLICT);
    }
    throw error;
  }
});

/**
 * Update tag by slug
 * PUT /api/tags/:slug
 */
router.put('/:slug', authenticate, requireAdminOrEditor, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const { name, isActive } = req.body;

    const tag = await Tag.findOne({ slug });

    if (!tag) {
      throw new ApiError('Tag not found', HttpStatus.NOT_FOUND);
    }

    // Update allowed fields
    if (name !== undefined) {
      tag.name = name;
      // Generate new slug if name changes
      tag.slug = generateSlug(name);
      
      // Check if new slug conflicts with existing tag
      const existingTag = await Tag.findOne({
        slug: tag.slug,
        _id: { $ne: tag._id },
      });
      
      if (existingTag) {
        throw new ApiError('Tag with this name already exists', HttpStatus.CONFLICT);
      }
    }
    
    if (isActive !== undefined) {
      tag.isActive = isActive;
    }

    await tag.save();

    const response: ApiResponse = {
      success: true,
      data: tag.toObject() as unknown,
      message: 'Tag updated successfully',
    };

    res.json(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Handle Mongoose validation errors
    if (error instanceof Error && error.name === 'ValidationError') {
      throw new ApiError(error.message, HttpStatus.BAD_REQUEST);
    }
    // Handle duplicate key errors
    if (error instanceof Error && (error as { code?: number }).code === 11000) {
      throw new ApiError('Tag with this name or slug already exists', HttpStatus.CONFLICT);
    }
    throw error;
  }
});

/**
 * Delete tag by slug
 * DELETE /api/tags/:slug
 */
router.delete('/:slug', authenticate, requireAdminOrEditor, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;

    const tag = await Tag.findOne({ slug });

    if (!tag) {
      throw new ApiError('Tag not found', HttpStatus.NOT_FOUND);
    }

    await Tag.deleteOne({ _id: tag._id });

    res.status(HttpStatus.NO_CONTENT).send();
  } catch (error) {
    throw error;
  }
});

export default router;

