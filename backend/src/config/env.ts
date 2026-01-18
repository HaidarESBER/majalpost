import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

interface EnvironmentVariables {
  PORT: number;
  MONGODB_URI: string;
  NODE_ENV: 'development' | 'production' | 'test';
  FRONTEND_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  UPLOAD_DIR: string;
  THUMBNAIL_DIR: string;
  MAX_FILE_SIZE: number;
  SMTP_HOST: string;
  SMTP_PORT: number;
  SMTP_USER: string;
  SMTP_PASS: string;
  SMTP_FROM_EMAIL: string;
  SMTP_FROM_NAME: string;
  RESEND_API_KEY: string;
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
}

function getEnvVar(key: string, required: boolean = true): string {
  const value = process.env[key];
  if (required && !value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || '';
}

// Validate JWT secret
function getJwtSecret(): string {
  const secret = getEnvVar('JWT_SECRET', false);
  if (!secret) {
    const defaultSecret = 'your-secret-key-change-in-production';
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET is required in production environment');
    }
    console.warn('⚠️  WARNING: Using weak default JWT_SECRET. Set JWT_SECRET environment variable in production!');
    return defaultSecret;
  }
  
  // Validate secret strength
  if (secret.length < 32) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET must be at least 32 characters long in production');
    }
    console.warn('⚠️  WARNING: JWT_SECRET is too short. Use at least 32 characters in production!');
  }
  
  return secret;
}

// Resolve paths to absolute paths
function resolvePath(relativePath: string): string {
  if (path.isAbsolute(relativePath)) {
    return relativePath;
  }
  return path.resolve(process.cwd(), relativePath);
}

export const env: EnvironmentVariables = {
  PORT: parseInt(getEnvVar('PORT', false) || '5000', 10),
  MONGODB_URI: getEnvVar('MONGODB_URI'),
  NODE_ENV: (getEnvVar('NODE_ENV', false) || 'development') as EnvironmentVariables['NODE_ENV'],
  FRONTEND_URL: getEnvVar('FRONTEND_URL', false) || 'http://localhost:3000',
  JWT_SECRET: getJwtSecret(),
  JWT_EXPIRES_IN: getEnvVar('JWT_EXPIRES_IN', false) || '7d',
  UPLOAD_DIR: resolvePath(getEnvVar('UPLOAD_DIR', false) || './uploads'),
  THUMBNAIL_DIR: resolvePath(getEnvVar('THUMBNAIL_DIR', false) || './uploads/thumbnails'),
  MAX_FILE_SIZE: parseInt(getEnvVar('MAX_FILE_SIZE', false) || '10485760', 10), // 10MB default
  SMTP_HOST: getEnvVar('SMTP_HOST', false) || 'smtp.gmail.com',
  SMTP_PORT: parseInt(getEnvVar('SMTP_PORT', false) || '587', 10),
  SMTP_USER: getEnvVar('SMTP_USER', false) || '',
  SMTP_PASS: getEnvVar('SMTP_PASS', false) || '',
  SMTP_FROM_EMAIL: getEnvVar('SMTP_FROM_EMAIL', false) || getEnvVar('SMTP_USER', false) || 'noreply@majalpost.com',
  SMTP_FROM_NAME: getEnvVar('SMTP_FROM_NAME', false) || 'مجال بوست',
  RESEND_API_KEY: getEnvVar('RESEND_API_KEY', false) || '',
  CLOUDINARY_CLOUD_NAME: getEnvVar('CLOUDINARY_CLOUD_NAME', false) || '',
  CLOUDINARY_API_KEY: getEnvVar('CLOUDINARY_API_KEY', false) || '',
  CLOUDINARY_API_SECRET: getEnvVar('CLOUDINARY_API_SECRET', false) || '',
};

export default env;
