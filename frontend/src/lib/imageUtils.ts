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

  // If it's already a full URL (Cloudinary or external), return as-is
  // Check for http:// or https:// at the start (case insensitive for safety)
  const lowerPath = trimmedPath.toLowerCase();
  if (lowerPath.startsWith('http://') || lowerPath.startsWith('https://')) {
    return trimmedPath;
  }

  // Also check if it looks like it already has a domain (contains :// anywhere)
  // This catches cases where the URL might have been incorrectly prefixed
  if (trimmedPath.includes('://')) {
    // Extract the URL part after the last :// (in case it was double-prefixed)
    const lastProtocolIndex = trimmedPath.lastIndexOf('://');
    if (lastProtocolIndex > 0) {
      // If :// appears after the start, it might be double-prefixed
      // Extract everything from the last protocol
      return trimmedPath.substring(trimmedPath.lastIndexOf('://') - 4); // -4 to include 'http' or 'https'
    }
    return trimmedPath;
  }

  // Otherwise, prepend the API base URL (without /api)
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
  return `${apiBaseUrl}${trimmedPath}`;
}

