import { Request, Response, NextFunction } from 'express';
import { createRequire } from 'module';
import { env } from '../config/env.js';
import { ApiError, HttpStatus } from '../types/index.js';

const require = createRequire(import.meta.url);
const jwt = require('jsonwebtoken');

/**
 * Extended Request interface with user info
 */
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

/**
 * Authentication middleware
 * Verifies JWT token and attaches user info to request
 */
export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError('Authentication token required', HttpStatus.UNAUTHORIZED);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET);
      
      // Validate payload structure
      if (
        typeof decoded !== 'object' ||
        decoded === null ||
        !('userId' in decoded) ||
        !('email' in decoded) ||
        !('role' in decoded) ||
        typeof decoded.userId !== 'string' ||
        typeof decoded.email !== 'string' ||
        typeof decoded.role !== 'string'
      ) {
        throw new ApiError('Invalid token payload', HttpStatus.UNAUTHORIZED);
      }

      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      };

      next();
    } catch (error) {
      throw new ApiError('Invalid or expired token', HttpStatus.UNAUTHORIZED);
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Authentication failed', HttpStatus.UNAUTHORIZED);
  }
}

