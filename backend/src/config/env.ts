import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface EnvironmentVariables {
  PORT: number;
  MONGODB_URI: string;
  NODE_ENV: 'development' | 'production' | 'test';
  FRONTEND_URL: string;
}

function getEnvVar(key: string, required: boolean = true): string {
  const value = process.env[key];
  if (required && !value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || '';
}

export const env: EnvironmentVariables = {
  PORT: parseInt(getEnvVar('PORT', false) || '5000', 10),
  MONGODB_URI: getEnvVar('MONGODB_URI'),
  NODE_ENV: (getEnvVar('NODE_ENV', false) || 'development') as EnvironmentVariables['NODE_ENV'],
  FRONTEND_URL: getEnvVar('FRONTEND_URL', false) || 'http://localhost:3000',
};

export default env;
