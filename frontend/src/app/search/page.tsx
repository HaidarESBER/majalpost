'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { SearchResult } from '@shared/types';
import SearchBar from '@/components/SearchBar';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';

  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
    hasMore: false,
  });
  const [currentOffset, setCurrentOffset] = useState(0);

  useEffect(() => {
    // Reset offset when query changes
    setCurrentOffset(0);
    setPagination({ total: 0, limit: 20, offset: 0, hasMore: false });
  }, [query]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.searchArticles(query, {
          limit: 20,
          offset: currentOffset,
        });

        if (response.success && response.data) {
          if (currentOffset === 0) {
            // First page - replace results
            setResults(response.data.results);
          } else {
            // Subsequent pages - append results
            setResults((prev) => [...prev, ...(response.data?.results || [])]);
          }
          setPagination(response.data?.pagination || { total: 0, page: 1, limit: 20, totalPages: 0, hasMore: false });
        } else {
          setError(response.error || 'فشل البحث');
          if (currentOffset === 0) {
            setResults([]);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'حدث خطأ أثناء البحث');
        if (currentOffset === 0) {
          setResults([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, currentOffset]);

  const handleLoadMore = () => {
    setCurrentOffset((prev) => prev + 20);
  };

  const handlePrevious = () => {
    setCurrentOffset((prev) => Math.max(0, prev - 20));
    // Reset to first page results when going back
    if (currentOffset <= 20) {
      setResults([]);
      setCurrentOffset(0);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Search Bar */}
          <div className="mb-8">
            <SearchBar />
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
              <p className="text-gray-600 text-lg font-medium">جاري البحث...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-xl p-6 text-red-700">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Results Count */}
          {!loading && !error && query && (
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <p className="text-gray-700 font-semibold">
                {pagination.total > 0 ? (
                  <span className="text-purple-600">تم العثور على {pagination.total} نتيجة</span>
                ) : (
                  <span>لا توجد نتائج</span>
                )}
              </p>
            </div>
          )}

          {/* Empty Query State */}
          {!query && !loading && (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-purple-100 flex items-center justify-center">
                <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="text-gray-600 text-xl font-medium mb-2">ابدأ البحث</p>
              <p className="text-gray-500">أدخل كلمة بحث للعثور على المقالات</p>
            </div>
          )}

          {/* Results List */}
          {!loading && !error && results.length > 0 && (
            <div className="space-y-4">
              {results.map((article, index) => (
                <article
                  key={article._id}
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex flex-col md:flex-row gap-4">
                    {article.featuredImage && (
                      <div className="md:w-48 flex-shrink-0">
                        <Link href={`/article/${article.slug}`} className="block">
                          <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                            <img
                              src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'}${article.featuredImage}`}
                              alt={article.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </Link>
                      </div>
                    )}
                    <div className="flex-1">
                      <Link href={`/article/${article.slug}`} className="block">
                        <h2 className="text-2xl font-bold mb-3 hover:text-purple-600 transition-colors line-clamp-2">
                          {article.title}
                        </h2>
                        <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">{article.excerpt}</p>
                      </Link>
                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        {article.category && (
                          <Link
                            href={`/category/${article.category.slug}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white font-medium transition-all hover:scale-105"
                            style={{ backgroundColor: article.category.color || '#6b7280' }}
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            {article.category.name}
                          </Link>
                        )}
                        {article.tags && article.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {article.tags.slice(0, 3).map((tag) => (
                              <Link
                                key={tag._id}
                                href={`/tag/${tag.slug}`}
                                className="px-2.5 py-1 rounded-full text-xs bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors font-medium"
                              >
                                #{tag.name}
                              </Link>
                            ))}
                          </div>
                        )}
                        {article.publishedAt && (
                          <div className="flex items-center gap-1.5 text-gray-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <time dateTime={article.publishedAt.toString()}>
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
                </article>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && !error && results.length > 0 && (
            <div className="flex items-center justify-center gap-4 pt-8">
              {pagination.offset > 0 && (
                <button
                  onClick={handlePrevious}
                  className="inline-flex items-center gap-2 px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  السابق
                </button>
              )}
              {pagination.hasMore && (
                <button
                  onClick={handleLoadMore}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold"
                >
                  <span>عرض المزيد</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8"><p className="text-center">جاري التحميل...</p></div>}>
      <SearchPageContent />
    </Suspense>
  );
}
