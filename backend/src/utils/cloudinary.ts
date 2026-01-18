import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env.js';

// Configure Cloudinary
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

/**
 * Upload image to Cloudinary
 * @param buffer - Image buffer
 * @param folder - Folder path in Cloudinary (optional)
 * @param options - Additional Cloudinary upload options
 * @returns Upload result with URL and public_id
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  folder: string = 'majalpost',
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: string;
  } = {}
): Promise<{
  url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}> {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder,
      resource_type: 'image' as const,
      ...options,
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(new Error(`Cloudinary upload failed: ${error.message}`));
          return;
        }

        if (!result) {
          reject(new Error('Cloudinary upload returned no result'));
          return;
        }

        resolve({
          url: result.secure_url,
          public_id: result.public_id,
          width: result.width || 0,
          height: result.height || 0,
          format: result.format || 'jpg',
          bytes: result.bytes || 0,
        });
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * Generate thumbnail URL from Cloudinary public_id
 * @param public_id - Cloudinary public_id
 * @param options - Transformation options
 * @returns Thumbnail URL
 */
export function getThumbnailUrl(
  public_id: string,
  options: { width?: number; height?: number; quality?: number } = {}
): string {
  const { width = 400, height = 400, quality = 80 } = options;

  return cloudinary.url(public_id, {
    width,
    height,
    crop: 'fill',
    quality,
    fetch_format: 'auto',
  });
}

/**
 * Delete image from Cloudinary
 * @param public_id - Cloudinary public_id
 * @returns Delete result
 */
export async function deleteFromCloudinary(public_id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(public_id, (error, result) => {
      if (error) {
        reject(new Error(`Cloudinary delete failed: ${error.message}`));
        return;
      }

      if (result?.result !== 'ok' && result?.result !== 'not found') {
        reject(new Error('Cloudinary delete failed'));
        return;
      }

      resolve();
    });
  });
}

/**
 * Get optimized image URL from Cloudinary
 * @param public_id - Cloudinary public_id
 * @param options - Transformation options
 * @returns Optimized image URL
 */
export function getOptimizedUrl(
  public_id: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: string;
  } = {}
): string {
  return cloudinary.url(public_id, {
    ...options,
    fetch_format: options.format || 'auto',
    quality: options.quality || 'auto',
  });
}

export default cloudinary;

