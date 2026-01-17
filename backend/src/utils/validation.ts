import mongoose from 'mongoose';
import { ApiError, HttpStatus } from '../types/index.js';

/**
 * Validate MongoDB ObjectId
 * @param id The ID to validate
 * @param fieldName Optional field name for error message
 * @returns The validated ObjectId as string
 * @throws ApiError if invalid
 */
export function validateObjectId(id: string, fieldName: string = 'ID'): string {
  if (!id || typeof id !== 'string') {
    throw new ApiError(`${fieldName} is required`, HttpStatus.BAD_REQUEST);
  }
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(`Invalid ${fieldName} format`, HttpStatus.BAD_REQUEST);
  }
  
  return id;
}

/**
 * Validate multiple ObjectIds
 * @param ids Array of IDs to validate
 * @param fieldName Optional field name for error message
 * @returns Array of validated ObjectIds
 * @throws ApiError if any are invalid
 */
export function validateObjectIds(ids: string[], fieldName: string = 'IDs'): string[] {
  if (!Array.isArray(ids)) {
    throw new ApiError(`${fieldName} must be an array`, HttpStatus.BAD_REQUEST);
  }
  
  return ids.map((id, index) => validateObjectId(id, `${fieldName}[${index}]`));
}

