import { Router, Response } from 'express';
import { User } from '../models/User.js';
import { ApiResponse } from '../types/index.js';
import { ApiError, HttpStatus } from '../types/index.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

/**
 * All routes require authentication
 */
router.use(authenticate);

/**
 * Get all users (admin/editor only)
 * GET /api/users
 * Query params: ?page=1&limit=20
 */
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userRole = req.user?.role;

    if (userRole !== 'admin' && userRole !== 'editor') {
      throw new ApiError('Admin access required', HttpStatus.FORBIDDEN);
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find()
        .select('-password') // Exclude password
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(),
    ]);

    const totalPages = Math.ceil(total / limit);

    const response: ApiResponse<{
      items: typeof users;
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    }> = {
      success: true,
      data: {
        items: users,
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
    if (error instanceof ApiError) {
      throw error;
    }
    throw error;
  }
});

/**
 * Get current user profile
 * GET /api/users/me
 */
router.get('/me', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw new ApiError('Authentication required', HttpStatus.UNAUTHORIZED);
    }

    const user = await User.findById(userId).lean();

    if (!user) {
      throw new ApiError('User not found', HttpStatus.NOT_FOUND);
    }

    const response: ApiResponse<typeof user> = {
      success: true,
      data: user,
    };

    res.json(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw error;
  }
});

/**
 * Update current user profile
 * PUT /api/users/me
 * Body: { name?, profilePicture? }
 */
router.put('/me', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw new ApiError('Authentication required', HttpStatus.UNAUTHORIZED);
    }

    const { name, profilePicture } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError('User not found', HttpStatus.NOT_FOUND);
    }

    // Update allowed fields
    if (name !== undefined) {
      user.name = name.trim();
    }

    if (profilePicture !== undefined) {
      user.profilePicture = profilePicture || undefined;
    }

    await user.save();

    const response: ApiResponse = {
      success: true,
      data: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        profilePicture: user.profilePicture,
      },
      message: 'Profile updated successfully',
    };

    res.json(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof Error && error.name === 'ValidationError') {
      throw new ApiError(error.message, HttpStatus.BAD_REQUEST);
    }
    throw error;
  }
});

/**
 * Update user by ID (admin/editor only)
 * PUT /api/users/:id
 * Body: { name?, email?, role?, password? }
 */
router.put('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userRole = req.user?.role;

    if (userRole !== 'admin' && userRole !== 'editor') {
      throw new ApiError('Admin access required', HttpStatus.FORBIDDEN);
    }

    const { id } = req.params;
    const { name, email, role, password } = req.body;

    // Validate ObjectId
    validateObjectId(id, 'User ID');

    const user = await User.findById(id);

    if (!user) {
      throw new ApiError('User not found', HttpStatus.NOT_FOUND);
    }

    // Update allowed fields
    if (name !== undefined) {
      user.name = name.trim();
    }

    if (email !== undefined) {
      const trimmedEmail = email.trim().toLowerCase();
      // Check if email is already taken by another user
      const existingUser = await User.findOne({ email: trimmedEmail });
      if (existingUser && existingUser._id.toString() !== id) {
        throw new ApiError('Email already in use', HttpStatus.CONFLICT);
      }
      user.email = trimmedEmail;
    }

    if (role !== undefined) {
      // Validate role
      const validRoles = ['admin', 'editor', 'contributor', 'user'];
      if (!validRoles.includes(role)) {
        throw new ApiError('Invalid role', HttpStatus.BAD_REQUEST);
      }
      user.role = role;
    }

    if (password !== undefined && password !== '') {
      // Validate password meets requirements (model will validate, but provide clear error)
      if (password.length < 8) {
        throw new ApiError('Password must be at least 8 characters long', HttpStatus.BAD_REQUEST);
      }
      if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
        throw new ApiError('Password must contain at least one letter and one number', HttpStatus.BAD_REQUEST);
      }
      // Only update password if a new one is provided
      user.password = password;
    }

    await user.save();

    const response: ApiResponse = {
      success: true,
      data: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        profilePicture: user.profilePicture,
      },
      message: 'User updated successfully',
    };

    res.json(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof Error && error.name === 'ValidationError') {
      throw new ApiError(error.message, HttpStatus.BAD_REQUEST);
    }
    throw error;
  }
});

export default router;

