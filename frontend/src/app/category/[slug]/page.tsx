'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { getImageUrl } from '@/lib/imageUtils';

interface Category {
  _id: string;
  name: string;
  nameEn: string;
  slug: string;
  description?: string;
  color: string;
}

interface Article {
  _id: string;
  title: string;
  excerpt: string;
  slug: string;
  featuredImage?: string;
  category: Category;
  tags: Array<{ _id: string; name: string; slug: string }>;
  author: { _id: string; name: string };
  publishedAt: string;
  createdAt: string;
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

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch category
        const categoryResponse = await api.get<Category>(`/categories/${slug}`);
        if (!categoryResponse.success || !categoryResponse.data) {
          setError(categoryResponse.error || 'فشل تحميل الفئة');
          setLoading(false);
          return;
        }
        setCategory(categoryResponse.data);

        // Fetch articles for this category
        const articlesResponse = await api.get<ArticlesResponse>(`/articles/public?category=${slug}&limit=20`);
        if (articlesResponse.success && articlesResponse.data) {
          setArticles(articlesResponse.data.items);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'حدث خطأ أثناء تحميل الفئة');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchData();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-5xl mx-auto">
            <div className="animate-pulse space-y-8">
              <div className="h-32 bg-gray-200 rounded-xl"></div>
              <div className="h-8 bg-gray-200 rounded w-48"></div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-2xl p-8 md:p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-red-900 mb-3">خطأ</h1>
              <p className="text-red-700 text-lg mb-6">{error || 'الفئة غير موجودة'}</p>
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Category Header */}
          <div
            className="border-r-5 rounded-2xl p-8 md:p-10 bg-white shadow-lg"
            style={{ borderRightColor: category.color || '#6b7280', borderRightWidth: '6px' }}
          >
            <div className="flex items-center gap-4 mb-4">
              <div 
                className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg"
                style={{ backgroundColor: category.color || '#6b7280' }}
              >
                {category.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">{category.name}</h1>
                {category.description && (
                  <p className="text-gray-600 text-lg md:text-xl leading-relaxed">{category.description}</p>
                )}
              </div>
            </div>
          </div>

          {/* Articles Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-900">المقالات</h2>
              <span className="text-gray-500 font-medium">{articles.length} مقال</span>
            </div>
            {articles.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-12 md:p-16 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-600 text-xl font-medium mb-2">لا توجد مقالات بعد</p>
                <p className="text-gray-500">لا توجد مقالات منشورة في هذه الفئة بعد</p>
              </div>
            ) : (
              <div className="space-y-4">
                {articles.map((article, index) => (
                  <Link
                    key={article._id}
                    href={`/article/${article.slug}`}
                    className="block bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex flex-col md:flex-row gap-6">
                      {article.featuredImage && (
                        <div className="md:w-56 flex-shrink-0">
                          <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 shadow-md">
                            <img
                              src={getImageUrl(article.featuredImage)}
                              alt={article.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold mb-3 hover:text-purple-600 transition-colors line-clamp-2">
                          {article.title}
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">{article.excerpt}</p>
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          {article.tags && article.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {article.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag._id}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs bg-purple-50 text-purple-700 font-medium"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                                  </svg>
                                  {tag.name}
                                </span>
                              ))}
                            </div>
                          )}
                          {article.publishedAt && (
                            <div className="flex items-center gap-1.5 text-gray-500">
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
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Back to Home */}
          <div className="pt-6">
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
        </div>
      </div>
    </div>
  );
}
