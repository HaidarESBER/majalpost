/**
 * Get the full image URL from a path or URL
 * Handles both Cloudinary URLs (full URLs) and API endpoints (relative paths)
 * @param imagePath - Image path or full URL
 * @returns Full URL to the image
 */
export function getImageUrl(imagePath: string | undefined | null): string {
  if (!imagePath) {
    return '';
  }

  // Trim whitespace
  const trimmedPath = imagePath.trim();

  // Check if URL was incorrectly double-prefixed (contains API URL + Cloudinary URL)
  // Pattern: https://majalpost-production.up.railway.apphttps://res.cloudinary.com/...
  const cloudinaryPattern = 'https://res.cloudinary.com';
  const cloudinaryIndex = trimmedPath.indexOf(cloudinaryPattern);
  
  if (cloudinaryIndex > 0) {
    // URL appears to be double-prefixed, extract just the Cloudinary URL
    return trimmedPath.substring(cloudinaryIndex);
  }
  
  if (cloudinaryIndex === 0) {
    // URL already starts with Cloudinary URL, return as-is
    return trimmedPath;
  }

  // If it's already a full URL (starts with http:// or https://), return as-is
  if (trimmedPath.startsWith('http://') || trimmedPath.startsWith('https://')) {
    return trimmedPath;
  }

  // If it's just a filename (ends with .png, .jpg, etc.) without a path, this is invalid
  // Log a warning and return empty string to prevent broken image requests
  if (/^[^/\\]+\.(png|jpg|jpeg|gif|webp)$/i.test(trimmedPath)) {
    console.warn('Invalid image path (filename only):', trimmedPath);
    return '';
  }

  // Otherwise, prepend the API base URL (without /api)
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
  return `${apiBaseUrl}${trimmedPath}`;
}

