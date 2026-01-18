/**
 * API configuration
 */
const envApiUrl = process.env.NEXT_PUBLIC_API_URL;

// Validate and normalize API URL
let API_URL: string;
if (envApiUrl) {
  // Ensure it starts with http:// or https://
  if (!envApiUrl.startsWith('http://') && !envApiUrl.startsWith('https://')) {
    console.error('NEXT_PUBLIC_API_URL must start with http:// or https://');
    API_URL = 'http://localhost:5000/api';
  } else {
    API_URL = envApiUrl.endsWith('/') ? envApiUrl.slice(0, -1) : envApiUrl;
  }
} else {
  API_URL = 'http://localhost:5000/api';
}

export { API_URL };

