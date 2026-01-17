import { Request, Response, NextFunction } from 'express';
import { ApiError, ApiResponse, HttpStatus } from '../types/index.js';
import { env } from '../config/env.js';

/**
 * 404 Not Found handler for unknown routes
 */
export function notFoundHandler(req: Request, res: Response, next: NextFunction): void {
  const error = new ApiError(`Route not found: ${req.method} ${req.originalUrl}`, HttpStatus.NOT_FOUND);
  next(error);
}

/**
 * Global error handler middleware
 * Must be registered after all routes
 */
export function globalErrorHandler(
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Default values
  let statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR;
  let message = 'Internal server error';
  let isOperational = false;

  // Handle ApiError instances
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
  } else if (err instanceof Error) {
    message = err.message;
  }

  // Log error in development
  if (env.NODE_ENV === 'development') {
    console.error('Error:', {
      message: err.message,
      stack: err.stack,
      statusCode,
      url: req.originalUrl,
      method: req.method,
    });
  } else if (!isOperational) {
    // Log unexpected errors in production
    console.error('Unexpected error:', err.message);
  }

  // Build response
  const response: ApiResponse = {
    success: false,
    error: message,
  };

  // Include stack trace in development mode only
  if (env.NODE_ENV === 'development' && err.stack) {
    (response as ApiResponse & { stack?: string }).stack = err.stack;
  }

  res.status(statusCode).json(response);
}

export default { notFoundHandler, globalErrorHandler };
