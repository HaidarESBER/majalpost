'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
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
  status?: 'draft' | 'pending_review' | 'published';
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

export default function ArticlesPage() {
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
  const [filterPublished, setFilterPublished] = useState<string>('all');

  useEffect(() => {
    fetchArticles();
  }, [page, filterPublished]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      let queryParams = `page=${page}&limit=20`;
      
      // Handle different filter types
      if (filterPublished === 'published') {
        queryParams += `&isPublished=true`;
      } else if (filterPublished === 'draft') {
        queryParams += `&isPublished=false`;
      }
      // For 'pending' and 'all', fetch all articles and filter on frontend
      
      const response = await api.get<ArticlesResponse>(`/articles?${queryParams}`);
      if (response.success && response.data) {
        let filteredArticles = response.data.items;
        
        // Filter by status on frontend if needed
        if (filterPublished === 'pending') {
          filteredArticles = filteredArticles.filter(
            (article) => article.status === 'pending_review'
          );
        }
        
        setArticles(filteredArticles);
        // Update pagination - for pending filter, we need to recalculate
        if (filterPublished === 'pending') {
          setPagination({
            ...response.data.pagination,
            total: filteredArticles.length,
            totalPages: Math.ceil(filteredArticles.length / 20),
          });
        } else {
          setPagination(response.data.pagination);
        }
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

  const handleApprove = async (slug: string) => {
    if (!confirm('Are you sure you want to approve and publish this article?')) {
      return;
    }

    try {
      const response = await api.put(`/articles/${slug}`, {
        status: 'published',
        isPublished: true,
      });
      if (response.success) {
        fetchArticles();
      } else {
        alert(response.error || 'Failed to approve article');
      }
    } catch (err) {
      alert('Error approving article');
      console.error(err);
    }
  };

  const handleReject = async (slug: string) => {
    if (!confirm('Are you sure you want to reject this article? It will be moved back to draft status.')) {
      return;
    }

    try {
      const response = await api.put(`/articles/${slug}`, {
        status: 'draft',
        isPublished: false,
      });
      if (response.success) {
        fetchArticles();
      } else {
        alert(response.error || 'Failed to reject article');
      }
    } catch (err) {
      alert('Error rejecting article');
      console.error(err);
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not published';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading && articles.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
            <p className="text-gray-600">Loading articles...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Articles</h1>
            <p className="text-sm text-gray-600 mt-1">Manage your articles and content</p>
          </div>
          <Link
            href="/admin/articles/new"
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            + New Article
          </Link>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4 mb-6">
          <label className="text-sm font-medium text-gray-700">Filter:</label>
          <select
            value={filterPublished}
            onChange={(e) => {
              setFilterPublished(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Articles</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
            <option value="pending">Pending Review</option>
          </select>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Articles List */}
        {articles.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-2">No articles found</p>
            <p className="text-sm mb-4">Create your first article to get started</p>
            <Link
              href="/admin/articles/new"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors inline-block"
            >
              Create Article
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Title</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Author</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Published</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map((article) => (
                    <tr key={article._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{article.title}</div>
                        <div className="text-sm text-gray-500 mt-1 line-clamp-1">{article.excerpt}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className="inline-block px-2 py-1 text-xs font-medium rounded text-white"
                          style={{ backgroundColor: article.category.color }}
                        >
                          {article.category.nameEn}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-700">{article.author.name}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                            article.status === 'published' || article.isPublished
                              ? 'bg-green-100 text-green-800'
                              : article.status === 'pending_review'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {article.status === 'pending_review'
                            ? 'Pending Review'
                            : article.isPublished
                            ? 'Published'
                            : 'Draft'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{formatDate(article.publishedAt)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end space-x-2">
                          {article.status === 'pending_review' && (
                            <>
                              <button
                                onClick={() => handleApprove(article.slug)}
                                className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors font-medium"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(article.slug)}
                                className="px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors font-medium"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          <Link
                            href={`/admin/articles/${article.slug}/edit`}
                            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(article.slug)}
                            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 pt-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-700">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
