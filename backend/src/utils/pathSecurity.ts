import path from 'path';
import { env } from '../config/env.js';
import { ApiError, HttpStatus } from '../types/index.js';

/**
 * Validate file path to prevent path traversal attacks
 * @param filePath The file path to validate
 * @param baseDir The base directory the file should be within
 * @returns Normalized absolute path
 * @throws ApiError if path is invalid or outside base directory
 */
export function validateFilePath(filePath: string, baseDir: string): string {
  // Resolve to absolute paths
  const resolvedPath = path.resolve(filePath);
  const resolvedBaseDir = path.resolve(baseDir);

  // Check for path traversal attempts (contains ..)
  if (filePath.includes('..')) {
    throw new ApiError('Invalid file path', HttpStatus.BAD_REQUEST);
  }

  // Ensure the resolved path is within the base directory
  if (!resolvedPath.startsWith(resolvedBaseDir)) {
    throw new ApiError('File path is outside allowed directory', HttpStatus.BAD_REQUEST);
  }

  return resolvedPath;
}

/**
 * Validate upload directory path
 * @param filePath File path to validate
 * @returns Validated absolute path
 */
export function validateUploadPath(filePath: string): string {
  return validateFilePath(filePath, env.UPLOAD_DIR);
}

