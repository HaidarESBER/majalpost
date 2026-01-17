import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.js';
import { ApiError, HttpStatus } from '../types/index.js';

/**
 * Authorization middleware - requires admin or editor role
 * Must be used after authenticate middleware
 */
export function requireAdminOrEditor(req: AuthRequest, res: Response, next: NextFunction): void {
  const userRole = req.user?.role;
  
  if (userRole !== 'admin' && userRole !== 'editor') {
    throw new ApiError('Admin or editor access required', HttpStatus.FORBIDDEN);
  }
  
  next();
}

/**
 * Authorization middleware - requires admin role only
 * Must be used after authenticate middleware
 */
export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  const userRole = req.user?.role;
  
  if (userRole !== 'admin') {
    throw new ApiError('Admin access required', HttpStatus.FORBIDDEN);
  }
  
  next();
}

