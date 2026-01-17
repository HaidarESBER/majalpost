/**
 * Media Upload Helper Component
 * 
 * This file demonstrates how to integrate media upload functionality
 * into article creation forms.
 * 
 * USAGE IN ARTICLE CREATION:
 * 
 * 1. Upload media using the API endpoint:
 *    POST /api/media/upload
 *    FormData with 'image' field
 *    
 * 2. Response format:
 *    {
 *      success: true,
 *      data: {
 *        _id: string,
 *        filename: string,
 *        fileUrl: '/api/media/{id}/file',
 *        thumbnailUrl: '/api/media/{id}/thumbnail',
 *        width: number,
 *        height: number,
 *        size: number,
 *        mimeType: string,
 *        ...
 *      }
 *    }
 * 
 * 3. In your article form, store the media._id or fileUrl
 *    in the article's featuredImage field
 * 
 * EXAMPLE CODE:
 * 
 * ```tsx
 * import { api } from '@/lib/api';
 * import { API_URL } from '@/lib/config';
 * 
 * const handleMediaUpload = async (file: File) => {
 *   const formData = new FormData();
 *   formData.append('image', file);
 *   
 *   const token = api.getToken();
 *   const response = await fetch(`${API_URL}/media/upload`, {
 *     method: 'POST',
 *     headers: {
 *       Authorization: `Bearer ${token}`,
 *     },
 *     body: formData,
 *   });
 *   
 *   const result = await response.json();
 *   if (result.success) {
 *     // Use result.data._id or result.data.fileUrl in your article
 *     setArticleData({
 *       ...articleData,
 *       featuredImage: result.data.fileUrl, // or result.data._id
 *     });
 *   }
 * };
 * ```
 * 
 * MEDIA URLS:
 * - fileUrl: Full-size image URL (use for featured images)
 * - thumbnailUrl: Thumbnail URL (use for previews/lists)
 * - Both URLs are relative: '/api/media/{id}/file' or '/api/media/{id}/thumbnail'
 * - To get full URL: `${API_URL.replace('/api', '')}${fileUrl}`
 */

export {}; // This is just a documentation file

