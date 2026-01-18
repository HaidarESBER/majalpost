import { Router, Request, Response } from 'express';
import { createRequire } from 'module';
import { User, UserRole } from '../models/User.js';
import { ApiResponse } from '../types/index.js';
import { ApiError, HttpStatus } from '../types/index.js';
import { env } from '../config/env.js';
import { sendWelcomeEmail } from '../utils/emailService.js';
import { authLimiter } from '../middleware/rateLimit.js';

const require = createRequire(import.meta.url);
const jwt = require('jsonwebtoken');

const router = Router();

/**
 * Register a new user
 * POST /api/auth/register
 */
router.post('/register', authLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, role } = req.body;

    // Validation
    if (!email || !password || !name) {
      throw new ApiError('Email, password, and name are required', HttpStatus.BAD_REQUEST);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError('User with this email already exists', HttpStatus.CONFLICT);
    }

    // Validate role if provided (only allow setting role during registration in development)
    let userRole = role;
    if (!userRole) {
      // Default role should be regular USER, not CONTRIBUTOR
      userRole = UserRole.USER;
    } else if (!Object.values(UserRole).includes(role)) {
      throw new ApiError('Invalid role', HttpStatus.BAD_REQUEST);
    }

    // In production, only allow USER role during registration
    // Contributors must apply, admins/editors must be created manually
    if (env.NODE_ENV === 'production' && userRole !== UserRole.USER) {
      userRole = UserRole.USER;
    }

    // Create user
    const user = new User({
      email,
      password,
      name,
      role: userRole,
    });

    await user.save();

    // Send welcome email (don't await to avoid blocking the response)
    sendWelcomeEmail(user.email, user.name).catch((error) => {
      // Log email errors but don't fail registration (log in production too for debugging)
      // eslint-disable-next-line no-console
      console.error('Failed to send welcome email:', error);
    });

    // Generate JWT token
    const payload = { userId: user._id.toString(), email: user.email, role: user.role };
    const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });

    // Return user data (without password)
    const response: ApiResponse<{
      user: {
        id: string;
        email: string;
        name: string;
        role: string;
        profilePicture?: string;
      };
      token: string;
    }> = {
      success: true,
      data: {
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          profilePicture: user.profilePicture,
        },
        token,
      },
    };

    res.status(HttpStatus.CREATED).json(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Log the actual error for debugging (even in production to see Railway logs)
    console.error('Registration error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw new ApiError(`Failed to register user: ${error instanceof Error ? error.message : 'Unknown error'}`, HttpStatus.INTERNAL_SERVER_ERROR);
  }
});

/**
 * Login user
 * POST /api/auth/login
 */
router.post('/login', authLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      throw new ApiError('Email and password are required', HttpStatus.BAD_REQUEST);
    }

    // Find user and include password (using select('+password'))
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new ApiError('Invalid email or password', HttpStatus.UNAUTHORIZED);
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new ApiError('Invalid email or password', HttpStatus.UNAUTHORIZED);
    }

    // Generate JWT token
    const payload = { userId: user._id.toString(), email: user.email, role: user.role };
    const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });

    // Return user data (without password)
    const response: ApiResponse<{
      user: {
        id: string;
        email: string;
        name: string;
        role: string;
        profilePicture?: string;
      };
      token: string;
    }> = {
      success: true,
      data: {
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          profilePicture: user.profilePicture,
        },
        token,
      },
    };

    res.json(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Log the actual error for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('Login error:', error);
    }
    throw new ApiError(
      'Failed to login',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
});

export default router;

