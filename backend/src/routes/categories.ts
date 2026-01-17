import { Router, Response } from 'express';
import { Category } from '../models/Category.js';
import { ApiResponse } from '../types/index.js';
import { ApiError, HttpStatus } from '../types/index.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { requireAdminOrEditor } from '../middleware/authorize.js';

const router = Router();

/**
 * PUBLIC ROUTES (no authentication required)
 */

/**
 * Get all categories
 * GET /api/categories
 * Query params: ?isActive=true (optional filter)
 */
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { isActive } = req.query;
    const filter: Record<string, unknown> = {};
    
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const categories = await Category.find(filter)
      .sort({ order: 1, name: 1 })
      .lean();

    const response: ApiResponse<typeof categories> = {
      success: true,
      data: categories,
    };

    res.json(response);
  } catch (error) {
    throw error;
  }
});

/**
 * Get single category by slug
 * GET /api/categories/:slug
 */
router.get('/:slug', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;

    const category = await Category.findOne({ slug }).lean();

    if (!category) {
      throw new ApiError('Category not found', HttpStatus.NOT_FOUND);
    }

    const response: ApiResponse<typeof category> = {
      success: true,
      data: category,
    };

    res.json(response);
  } catch (error) {
    throw error;
  }
});

/**
 * PROTECTED ROUTES (require authentication)
 */

// All routes below require authentication and admin/editor role
router.use(authenticate);
router.use(requireAdminOrEditor);

/**
 * Create new category
 * POST /api/categories
 */
router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, nameEn, slug, description, color, subCategories, isActive, order } = req.body;

    // Validation
    if (!name || !nameEn || !slug || !color) {
      throw new ApiError('Name, nameEn, slug, and color are required', HttpStatus.BAD_REQUEST);
    }

    // Check for duplicate slug
    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
      throw new ApiError('Category with this slug already exists', HttpStatus.CONFLICT);
    }

    // Create category
    const category = new Category({
      name,
      nameEn,
      slug,
      description,
      color,
      subCategories: subCategories || [],
      isActive: isActive !== undefined ? isActive : true,
      order: order !== undefined ? order : 0,
    });

    await category.save();

    const response: ApiResponse = {
      success: true,
      data: category.toObject() as unknown,
      message: 'Category created successfully',
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
      throw new ApiError('Category with this slug already exists', HttpStatus.CONFLICT);
    }
    throw error;
  }
});

/**
 * Update category by slug
 * PUT /api/categories/:slug
 */
router.put('/:slug', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const { name, nameEn, description, color, subCategories, isActive, order } = req.body;

    const category = await Category.findOne({ slug });

    if (!category) {
      throw new ApiError('Category not found', HttpStatus.NOT_FOUND);
    }

    // Update allowed fields (slug cannot be changed)
    if (name !== undefined) category.name = name;
    if (nameEn !== undefined) category.nameEn = nameEn;
    if (description !== undefined) category.description = description;
    if (color !== undefined) category.color = color;
    if (subCategories !== undefined) category.subCategories = subCategories;
    if (isActive !== undefined) category.isActive = isActive;
    if (order !== undefined) category.order = order;

    await category.save();

    const response: ApiResponse = {
      success: true,
      data: category.toObject() as unknown,
      message: 'Category updated successfully',
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
    throw error;
  }
});

/**
 * Delete category by slug
 * DELETE /api/categories/:slug
 */
router.delete('/:slug', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;

    const category = await Category.findOne({ slug });

    if (!category) {
      throw new ApiError('Category not found', HttpStatus.NOT_FOUND);
    }

    await Category.deleteOne({ _id: category._id });

    res.status(HttpStatus.NO_CONTENT).send();
  } catch (error) {
    throw error;
  }
});

export default router;

