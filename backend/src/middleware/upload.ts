import multer from 'multer';
import path from 'path';
import { env } from '../config/env.js';
import { ApiError } from '../types/index.js';
import { HttpStatus } from '../types/index.js';

/**
 * Allowed image MIME types
 */
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

/**
 * Multer storage configuration
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Store files in uploads/original directory
    cb(null, path.join(env.UPLOAD_DIR, 'original'));
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-randomstring.extension
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

/**
 * File filter for image uploads
 */
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check MIME type
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(`Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`, HttpStatus.BAD_REQUEST));
  }
};

/**
 * Multer configuration
 */
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.MAX_FILE_SIZE,
    files: 1, // Single file upload
  },
});

/**
 * Upload middleware for single image file
 * Field name: 'image'
 */
export const uploadImage = upload.single('image');

export default upload;

