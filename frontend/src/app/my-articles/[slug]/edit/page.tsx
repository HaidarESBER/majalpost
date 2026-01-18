'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { API_URL } from '@/lib/config';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getImageUrl } from '@/lib/imageUtils';

interface Category {
  _id: string;
  name: string;
  nameEn: string;
  slug: string;
  color: string;
}

interface Tag {
  _id: string;
  name: string;
  slug: string;
}

interface Article {
  _id: string;
  title: string;
  excerpt: string;
  slug: string;
  content: string;
  featuredImage?: string;
  category: Category;
  tags: Tag[];
  isPublished: boolean;
  status: 'draft' | 'pending_review' | 'published';
  publishedAt?: string;
}

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [article, setArticle] = useState<Article | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: '',
    tags: [] as string[],
    featuredImage: '',
    isPublished: false,
  });
  const [featuredImagePreview, setFeaturedImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (user?.role !== 'contributor') {
        router.push('/');
      } else if (slug) {
        fetchArticle();
        fetchCategories();
        fetchTags();
      }
    }
  }, [authLoading, isAuthenticated, user, router, slug]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      const response = await api.get<Article>(`/articles/${slug}`);
      if (response.success && response.data) {
        setArticle(response.data);
        setFormData({
          title: response.data.title,
          excerpt: response.data.excerpt,
          content: response.data.content,
          category: response.data.category._id,
          tags: response.data.tags.map((t) => t._id),
          featuredImage: response.data.featuredImage || '',
          isPublished: response.data.isPublished,
        });
        if (response.data.featuredImage) {
          setFeaturedImagePreview(getImageUrl(response.data.featuredImage));
        }
      } else {
        setError(response.error || 'Article not found');
      }
    } catch (err) {
      setError('Error loading article');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get<Category[]>('/categories');
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await api.get<Tag[]>('/tags');
      if (response.success && response.data) {
        setTags(response.data);
      }
    } catch (err) {
      console.error('Error fetching tags:', err);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setFeaturedImagePreview(URL.createObjectURL(file));
    handleMediaUpload(file);
  };

  const handleMediaUpload = async (file: File) => {
    try {
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
        setFormData((prev) => ({ ...prev, featuredImage: result.data.fileUrl }));
        setFeaturedImagePreview(getImageUrl(result.data.fileUrl));
      } else {
        alert(result.error || 'Failed to upload image');
        setFeaturedImagePreview(article?.featuredImage ? getImageUrl(article.featuredImage) : null);
      }
    } catch (err) {
      alert('Error uploading image');
      console.error(err);
      setFeaturedImagePreview(article?.featuredImage ? getImageUrl(article.featuredImage) : null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const response = await api.put(`/articles/${slug}`, {
        title: formData.title,
        excerpt: formData.excerpt,
        content: formData.content,
        category: formData.category,
        tags: formData.tags,
        featuredImage: formData.featuredImage || undefined,
        isPublished: formData.isPublished,
      });

      if (response.success) {
        router.push('/my-articles');
      } else {
        setError(response.error || 'Failed to update article');
      }
    } catch (err) {
      setError('Error updating article');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleTagToggle = (tagId: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.includes(tagId)
        ? formData.tags.filter((id) => id !== tagId)
        : [...formData.tags, tagId],
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <p className="text-lg text-gray-900 mb-4">المقال غير موجود</p>
            <Link
              href="/my-articles"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors inline-block"
            >
              العودة للمقالات
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">تعديل المقال</h1>
              <p className="text-sm text-gray-600 mt-1">تحديث محتوى وإعدادات المقال</p>
            </div>
            <Link
              href="/my-articles"
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              إلغاء
            </Link>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                العنوان <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الملخص <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                rows={3}
                maxLength={500}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">{(formData.excerpt || '').length}/500 حرف</p>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المحتوى <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={15}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
              />
            </div>

            {/* Category and Tags Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الفئة <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">اختر فئة</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.nameEn} ({cat.name})
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">العلامات</label>
                <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto">
                  {tags.length === 0 ? (
                    <p className="text-sm text-gray-500">لا توجد علامات متاحة</p>
                  ) : (
                    <div className="space-y-2">
                      {tags.map((tag) => (
                        <label key={tag._id} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.tags.includes(tag._id)}
                            onChange={() => handleTagToggle(tag._id)}
                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          />
                          <span className="text-sm text-gray-700">{tag.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Featured Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الصورة الرئيسية</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              {featuredImagePreview ? (
                <div className="space-y-4">
                  <img
                    src={featuredImagePreview}
                    alt="Featured"
                    className="w-full max-h-64 object-cover rounded-lg border border-gray-300"
                  />
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      تغيير الصورة
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFeaturedImagePreview(null);
                        setFormData((prev) => ({ ...prev, featuredImage: '' }));
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      إزالة
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-4 py-12 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 transition-colors text-gray-600"
                >
                  <div className="text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400 mb-2"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 8M7 16h20"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <p className="text-sm font-medium">انقر لرفع صورة</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF حتى 10MB</p>
                  </div>
                </button>
              )}
            </div>

            {/* Status Display */}
            {article.status === 'pending_review' && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>قيد المراجعة:</strong> هذا المقال قيد المراجعة من قبل الإدارة
                </p>
              </div>
            )}

            {/* Publish Status */}
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  disabled={article.status === 'pending_review'}
                />
                <span className="text-sm font-medium text-gray-700">
                  {article.status === 'pending_review' ? 'قيد المراجعة (لا يمكن التعديل)' : 'إرسال للمراجعة والنشر'}
                </span>
              </label>
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <Link
                href="/my-articles"
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                إلغاء
              </Link>
              <button
                type="submit"
                disabled={saving || article.status === 'pending_review'}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'جاري الحفظ...' : formData.isPublished ? 'إرسال للمراجعة' : 'حفظ كمسودة'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

