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
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
  if (trimmedPath.startsWith(apiBaseUrl) && trimmedPath.includes('https://res.cloudinary.com')) {
    // Extract the Cloudinary URL part (everything after the API URL)
    const cloudinaryIndex = trimmedPath.indexOf('https://res.cloudinary.com');
    if (cloudinaryIndex > 0) {
      return trimmedPath.substring(cloudinaryIndex);
    }
  }

  // If it's already a full URL (Cloudinary or external), return as-is
  if (trimmedPath.startsWith('http://') || trimmedPath.startsWith('https://')) {
    return trimmedPath;
  }

  // Otherwise, prepend the API base URL (without /api)
  return `${apiBaseUrl}${trimmedPath}`;
}

