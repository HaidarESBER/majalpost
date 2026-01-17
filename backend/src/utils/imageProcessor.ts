import sharp from 'sharp';
import { env } from '../config/env.js';
import fs from 'fs/promises';
import path from 'path';

/**
 * Allowed image MIME types
 */
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

/**
 * Thumbnail generation options
 */
interface ThumbnailOptions {
  width?: number;
  height?: number;
  quality?: number;
}

/**
 * Generate thumbnail from image buffer
 */
export async function generateThumbnail(
  imageBuffer: Buffer,
  outputPath: string,
  options: ThumbnailOptions = {}
): Promise<void> {
  const { width = 400, height = 400, quality = 80 } = options;

  try {
    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    await fs.mkdir(outputDir, { recursive: true });

    // Generate thumbnail with sharp
    await sharp(imageBuffer)
      .resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality })
      .toFile(outputPath);
  } catch (error) {
    throw new Error(`Failed to generate thumbnail: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validate image file
 */
export async function validateImage(
  fileBuffer: Buffer,
  mimeType: string
): Promise<{ valid: boolean; error?: string }> {
  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(mimeType as any)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`,
    };
  }

  // Additional validation: try to process with sharp to verify it's a valid image
  try {
    await sharp(fileBuffer).metadata();
  } catch {
    return {
      valid: false,
      error: 'File content is not a valid image',
    };
  }

  // Check file size
  if (fileBuffer.length > env.MAX_FILE_SIZE) {
    const maxSizeMB = (env.MAX_FILE_SIZE / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${maxSizeMB}MB`,
    };
  }

  return { valid: true };
}

/**
 * Get image dimensions
 */
export async function getImageDimensions(
  imageBuffer: Buffer
): Promise<{ width: number; height: number }> {
  try {
    const metadata = await sharp(imageBuffer).metadata();
    if (!metadata.width || !metadata.height) {
      throw new Error('Could not extract image dimensions');
    }
    return {
      width: metadata.width,
      height: metadata.height,
    };
  } catch (error) {
    throw new Error(`Failed to get image dimensions: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

