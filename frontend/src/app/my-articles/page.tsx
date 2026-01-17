'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

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

interface Author {
  _id: string;
  name: string;
  email: string;
}

interface Article {
  _id: string;
  title: string;
  excerpt: string;
  slug: string;
  featuredImage?: string;
  category: Category;
  tags: Tag[];
  author: Author;
  publishedAt?: string;
  isPublished: boolean;
  status: 'draft' | 'pending_review' | 'published';
  createdAt: string;
  updatedAt: string;
}

interface ArticlesResponse {
  items: Article[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function MyArticlesPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (user?.role !== 'contributor') {
        router.push('/');
      } else {
        fetchArticles();
      }
    }
  }, [authLoading, isAuthenticated, user, router, page, statusFilter]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await api.get<ArticlesResponse>(`/articles?page=${page}&limit=20`);
      if (response.success && response.data) {
        let filteredArticles = response.data.items;
        
        // Filter by status
        if (statusFilter !== 'all') {
          filteredArticles = filteredArticles.filter((article) => {
            if (statusFilter === 'published') return article.status === 'published';
            if (statusFilter === 'pending') return article.status === 'pending_review';
            if (statusFilter === 'draft') return article.status === 'draft';
            return true;
          });
        }
        
        setArticles(filteredArticles);
        setPagination(response.data.pagination);
      } else {
        setError(response.error || 'Failed to fetch articles');
      }
    } catch (err) {
      setError('Error loading articles');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm('Are you sure you want to delete this article?')) {
      return;
    }

    try {
      const response = await api.delete(`/articles/${slug}`);
      if (response.success) {
        fetchArticles();
      } else {
        alert(response.error || 'Failed to delete article');
      }
    } catch (err) {
      alert('Error deleting article');
      console.error(err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <span className="px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800">منشور</span>;
      case 'pending_review':
        return <span className="px-2 py-1 text-xs font-medium rounded bg-yellow-100 text-yellow-800">قيد المراجعة</span>;
      case 'draft':
        return <span className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800">مسودة</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800">{status}</span>;
    }
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">مقالاتي</h1>
              <p className="text-sm text-gray-600 mt-1">إدارة مقالاتك ومراقبة حالة نشرها</p>
            </div>
            <Link
              href="/my-articles/new"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              + مقال جديد
            </Link>
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setStatusFilter('published')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'published'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              منشور
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'pending'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              قيد المراجعة
            </button>
            <button
              onClick={() => setStatusFilter('draft')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'draft'
                  ? 'bg-gray-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              مسودة
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Articles List */}
        {articles.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <p className="text-lg text-gray-500 mb-4">لا توجد مقالات</p>
            <Link
              href="/my-articles/new"
              className="inline-block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              إنشاء مقال جديد
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {articles.map((article) => (
              <div key={article._id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{article.title}</h3>
                      {getStatusBadge(article.status)}
                    </div>
                    <p className="text-gray-600 mb-3">{article.excerpt}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        {article.category.name}
                      </span>
                      <span>{new Date(article.createdAt).toLocaleDateString('ar-SA')}</span>
                      {article.isPublished && article.publishedAt && (
                        <span>نُشر في: {new Date(article.publishedAt).toLocaleDateString('ar-SA')}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Link
                      href={`/my-articles/${article.slug}/edit`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      تعديل
                    </Link>
                    <button
                      onClick={() => handleDelete(article.slug)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-4 py-2 bg-white rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              السابق
            </button>
            <span className="px-4 py-2 text-gray-700">
              صفحة {pagination.page} من {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= pagination.totalPages}
              className="px-4 py-2 bg-white rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              التالي
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

