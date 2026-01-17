/**
 * Media Upload Component Example
 * 
 * This is an example component showing how to integrate media upload
 * into your article creation form.
 * 
 * Copy this code and adapt it for your article creation page.
 */

'use client';

import { useState, useRef } from 'react';
import { api } from '@/lib/api';
import { API_URL } from '@/lib/config';

interface MediaUploadProps {
  onMediaSelected: (mediaId: string, fileUrl: string, thumbnailUrl?: string) => void;
  currentMediaUrl?: string;
}

export function MediaUploadExample({ onMediaSelected, currentMediaUrl }: MediaUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentMediaUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    // Show preview
    setPreview(URL.createObjectURL(file));

    // Upload file
    handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('image', file);

      const token = api.getToken();
      const response = await fetch(`${API_URL}/media/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (result.success && result.data) {
        // Call the callback with the media information
        onMediaSelected(
          result.data._id,
          result.data.fileUrl,
          result.data.thumbnailUrl
        );
        
        // Update preview with the uploaded image URL
        const fullUrl = `${API_URL.replace('/api', '')}${result.data.fileUrl}`;
        setPreview(fullUrl);
      } else {
        alert(result.error || 'Failed to upload media');
        setPreview(null);
      }
    } catch (err) {
      alert('Error uploading media');
      console.error(err);
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Featured Image
      </label>
      
      {preview && (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full max-h-64 object-cover rounded-lg border border-gray-300"
          />
        </div>
      )}

      <div className="flex items-center space-x-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Uploading...' : preview ? 'Change Image' : 'Upload Image'}
        </button>
        {preview && (
          <button
            type="button"
            onClick={() => {
              setPreview(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Remove
          </button>
        )}
      </div>

      <p className="text-xs text-gray-500">
        Upload an image file (PNG, JPG, GIF up to 10MB)
      </p>
    </div>
  );
}

/**
 * USAGE IN ARTICLE FORM:
 * 
 * ```tsx
 * const [articleData, setArticleData] = useState({
 *   title: '',
 *   content: '',
 *   featuredImage: '', // Store fileUrl here
 *   // ... other fields
 * });
 * 
 * <MediaUploadExample
 *   onMediaSelected={(mediaId, fileUrl, thumbnailUrl) => {
 *     setArticleData({
 *       ...articleData,
 *       featuredImage: fileUrl, // or mediaId, depending on your backend
 *     });
 *   }}
 *   currentMediaUrl={articleData.featuredImage}
 * />
 * ```
 */

