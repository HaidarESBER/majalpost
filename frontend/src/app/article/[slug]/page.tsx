'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

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

interface Comment {
  _id: string;
  content: string;
  author: {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
  };
  createdAt: string;
  updatedAt: string;
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
  author: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
  publishedAt: string;
  createdAt: string;
  views: number;
  likes: string[];
}

interface LikeResponse {
  liked: boolean;
  likesCount: number;
}

export default function ArticlePage() {
  const params = useParams();
  const slug = params.slug as string;
  const { user, isAuthenticated, login } = useAuth();

  const [article, setArticle] = useState<Article | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentContent, setCommentContent] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [liking, setLiking] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  useEffect(() => {
    if (slug) {
      fetchArticle();
    }
  }, [slug]);

  useEffect(() => {
    if (article?._id) {
      fetchComments(article._id);
    }
  }, [article?._id]);

  useEffect(() => {
    if (article && user) {
      setIsLiked(article.likes?.includes(user.id) || false);
      setLikesCount(article.likes?.length || 0);
    } else if (article) {
      setIsLiked(false);
      setLikesCount(article.likes?.length || 0);
    }
  }, [article, user]);

  const fetchArticle = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get<Article>(`/articles/public/${slug}`);
      if (response.success && response.data) {
        setArticle(response.data);
      } else {
        setError(response.error || 'Article not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading article');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (articleId: string) => {
    try {
      const response = await api.get<Comment[]>(`/comments?article=${articleId}`);
      if (response.success && response.data) {
        setComments(response.data);
      }
    } catch (err) {
      console.error('Error loading comments:', err);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      alert('Please log in to like articles');
      return;
    }

    setLiking(true);
    try {
      const response = await api.post<LikeResponse>(`/articles/${slug}/like`, {});
      if (response.success && response.data) {
        setIsLiked(response.data.liked);
        setLikesCount(response.data.likesCount);
      }
    } catch (err) {
      console.error('Error liking article:', err);
    } finally {
      setLiking(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      alert('Please log in to comment');
      return;
    }

    if (!commentContent.trim()) {
      return;
    }

    setSubmittingComment(true);
    try {
      const response = await api.post<Comment>('/comments', {
        content: commentContent,
        article: article?._id,
      });

      if (response.success && response.data) {
        setComments([response.data, ...comments]);
        setCommentContent('');
      } else {
        alert(response.error || 'Failed to post comment');
      }
    } catch (err) {
      alert('Error posting comment');
      console.error(err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      const response = await api.delete(`/comments/${commentId}`);
      if (response.success) {
        setComments(comments.filter((c) => c._id !== commentId));
      } else {
        alert(response.error || 'Failed to delete comment');
      }
    } catch (err) {
      alert('Error deleting comment');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-48"></div>
            <div className="h-96 bg-gray-200 rounded-xl"></div>
            <div className="h-6 bg-gray-200 rounded w-32"></div>
            <div className="h-12 bg-gray-200 rounded w-full"></div>
            <div className="h-6 bg-gray-200 rounded w-64"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-2xl p-8 md:p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-red-900 mb-3">خطأ</h1>
            <p className="text-red-700 text-lg mb-6">{error || 'المقال غير موجود'}</p>
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>العودة إلى الصفحة الرئيسية</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <article className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          {/* Back Link */}
          <div className="px-6 md:px-8 pt-6 md:pt-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium transition-colors group"
            >
              <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>العودة إلى الصفحة الرئيسية</span>
            </Link>
          </div>

          {/* Featured Image */}
          {article.featuredImage && (
            <div className="mx-6 md:mx-8 mb-8 rounded-xl overflow-hidden shadow-xl">
              <img
                src={`${apiBaseUrl}${article.featuredImage}`}
                alt={article.title}
                className="w-full h-auto max-h-[500px] object-cover"
              />
            </div>
          )}

          {/* Article Header */}
          <div className="px-6 md:px-8 mb-8">
            {/* Category Badge */}
            <div className="mb-4">
              <Link
                href={`/category/${article.category.slug}`}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl text-white hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                style={{ backgroundColor: article.category.color }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                {article.category.name}
              </Link>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 leading-tight">{article.title}</h1>

            {/* Excerpt */}
            {article.excerpt && (
              <p className="text-xl md:text-2xl text-gray-600 mb-6 leading-relaxed font-medium">{article.excerpt}</p>
            )}

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-6 text-sm mb-6 pb-6 border-b border-gray-200">
              <div className="flex items-center gap-2 text-gray-600">
                {article.author.profilePicture ? (
                  <img
                    src={`${apiBaseUrl}${article.author.profilePicture}`}
                    alt={article.author.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-xs">
                    {article.author.name.charAt(0)}
                  </div>
                )}
                <span className="font-medium">بواسطة {article.author.name}</span>
              </div>
              {article.publishedAt && (
                <div className="flex items-center gap-2 text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <time dateTime={article.publishedAt} className="font-medium">
                    {new Date(article.publishedAt).toLocaleDateString('ar-LB', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                </div>
              )}
              {/* Views */}
              <div className="flex items-center gap-2 text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className="font-medium">{article.views || 0} مشاهدة</span>
              </div>
            </div>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {article.tags.map((tag) => (
                  <Link
                    key={tag._id}
                    href={`/tag/${tag.slug}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full bg-purple-50 text-purple-700 hover:bg-purple-100 transition-all duration-300 hover:scale-105"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                    </svg>
                    {tag.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="px-6 md:px-8 mb-8">
            <div className="prose prose-lg max-w-none">
              <div className="whitespace-pre-wrap leading-relaxed text-gray-800 text-lg space-y-4">
                {article.content.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="mb-6">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Like Button and Actions */}
          <div className="px-6 md:px-8 py-6 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <button
                onClick={handleLike}
                disabled={liking || !isAuthenticated}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  isLiked
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <svg
                  className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`}
                  fill={isLiked ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>{likesCount} إعجاب</span>
              </button>
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium transition-colors group"
              >
                <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>العودة إلى الصفحة الرئيسية</span>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={`/category/${article.category.slug}`}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50 text-gray-700 hover:text-purple-700 transition-all duration-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span>مزيد من {article.category.name}</span>
              </Link>
            </div>
          </div>
        </article>

        {/* Comments Section */}
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 md:px-8 py-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">التعليقات ({comments.length})</h2>
          </div>

          {/* Comment Form */}
          {isAuthenticated ? (
            <div className="px-6 md:px-8 py-6 border-b border-gray-200">
              <form onSubmit={handleSubmitComment} className="space-y-4">
                <textarea
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  placeholder="اكتب تعليقك..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submittingComment || !commentContent.trim()}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submittingComment ? 'جاري الإرسال...' : 'إرسال التعليق'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="px-6 md:px-8 py-6 border-b border-gray-200 bg-gray-50 text-center">
              <p className="text-gray-600 mb-4">يجب تسجيل الدخول لإضافة تعليق</p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                تسجيل الدخول
              </Link>
            </div>
          )}

          {/* Comments List */}
          <div className="px-6 md:px-8 py-6">
            {comments.length === 0 ? (
              <p className="text-center text-gray-500 py-8">لا توجد تعليقات بعد</p>
            ) : (
              <div className="space-y-6">
                {comments.map((comment) => (
                  <div key={comment._id} className="border-b border-gray-100 pb-6 last:border-0">
                    <div className="flex items-start gap-4">
                      {comment.author.profilePicture ? (
                        <img
                          src={`${apiBaseUrl}${comment.author.profilePicture}`}
                          alt={comment.author.name}
                          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {comment.author.name.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-semibold text-gray-900">{comment.author.name}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(comment.createdAt).toLocaleDateString('ar-LB', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                          {isAuthenticated && (user?.id === comment.author._id || user?.role === 'admin' || user?.role === 'editor') && (
                            <button
                              onClick={() => handleDeleteComment(comment._id)}
                              className="text-red-600 hover:text-red-700 text-sm font-medium"
                            >
                              حذف
                            </button>
                          )}
                        </div>
                        <p className="text-gray-700 leading-relaxed">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
