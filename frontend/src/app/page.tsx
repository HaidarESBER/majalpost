'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { getImageUrl } from '@/lib/imageUtils';

interface Article {
  _id: string;
  title: string;
  excerpt: string;
  slug: string;
  featuredImage?: string;
  category: {
    _id: string;
    name: string;
    nameEn: string;
    slug: string;
    color: string;
  };
  publishedAt: string;
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

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(true);
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await api.get<ArticlesResponse>('/articles/public?limit=6');
        if (response.success && response.data) {
          setArticles(response.data.items);
        }
      } catch (err) {
        console.error('Error fetching articles:', err);
      } finally {
        setLoadingArticles(false);
      }
    };

    const fetchFeaturedArticles = async () => {
      try {
        const response = await api.get<Article[]>('/articles/public/featured?limit=10');
        if (response.success && response.data) {
          setFeaturedArticles(response.data);
        }
      } catch (err) {
        console.error('Error fetching featured articles:', err);
      } finally {
        setLoadingFeatured(false);
      }
    };

    fetchArticles();
    fetchFeaturedArticles();
  }, []);

  // Auto-rotate featured articles
  useEffect(() => {
    if (featuredArticles.length <= 1) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentFeaturedIndex((prev) => (prev + 1) % featuredArticles.length);
        setIsTransitioning(false);
      }, 500); // Half of transition duration
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [featuredArticles.length]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-animated-gradient">
        <div className="absolute inset-0 bg-animated-overlay"></div>
        <div className="absolute inset-0 bg-animated-accent"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center space-y-6 animate-fade-in-up">
            <div className="inline-block mb-4">
              <div className="relative w-48 h-48 md:w-64 md:h-64 mx-auto animate-scale-in">
                {/* Floating glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400/30 via-blue-400/30 to-green-400/30 rounded-full blur-3xl animate-float-gentle"></div>
                {/* Logo container with floating animation */}
                <div className="relative w-full h-full animate-float">
                  <img
                    src="/majalnobg.png"
                    alt="مجال بوست"
                    className="w-full h-full object-contain drop-shadow-2xl relative z-10 filter brightness-110 contrast-105"
                    style={{
                      filter: 'drop-shadow(0 25px 50px rgba(139, 92, 246, 0.3)) drop-shadow(0 15px 30px rgba(59, 130, 246, 0.2))',
                    }}
                  />
                  {/* Subtle gradient overlay for depth */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 rounded-full pointer-events-none z-20"></div>
                </div>
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-green-600 bg-clip-text text-transparent leading-tight">
              مجال بوست
            </h1>
            <p className="text-2xl md:text-3xl font-semibold text-gray-700 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              منصة إعلامية لبنانية مستقلة
            </p>
            <p className="mx-auto max-w-2xl text-lg md:text-xl leading-relaxed text-gray-600 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              صحافة بيئية واقتصادية واجتماعية تركز على القضايا المهمة للمواطن اللبناني،
              بعيداً عن الضجيج السياسي، نحو فهم أعمق للتحديات والفرص.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="w-full max-w-7xl mx-auto space-y-12 md:space-y-16">

        {/* Featured Articles */}
        {featuredArticles.length > 0 && (
          <div className="space-y-8 animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">مقالات مميزة</h2>
              <p className="text-gray-600">اكتشف أهم المقالات التي نرشحها لك</p>
            </div>
            
            <div className="relative h-[500px] md:h-[600px] rounded-2xl overflow-hidden shadow-2xl">
              {featuredArticles.map((article, index) => {
                const isActive = index === currentFeaturedIndex;
                const isNext = index === (currentFeaturedIndex + 1) % featuredArticles.length;
                
                return (
                  <Link
                    key={article._id}
                    href={`/article/${article.slug}`}
                    className={`absolute inset-0 transition-all duration-500 ${
                      isActive 
                        ? 'opacity-100 z-10' 
                        : isNext && isTransitioning
                        ? 'opacity-0 z-0'
                        : 'opacity-0 z-0 pointer-events-none'
                    }`}
                  >
                    <div className="relative w-full h-full">
                      {article.featuredImage ? (
                        <img
                          src={getImageUrl(article.featuredImage)}
                          alt={article.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error('Image failed to load:', getImageUrl(article.featuredImage));
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-600"></div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                      <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12 text-white">
                        <div
                          className="inline-block px-4 py-2 text-sm font-semibold rounded-full text-white mb-4 shadow-lg"
                          style={{ backgroundColor: article.category.color }}
                        >
                          {article.category.name}
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
                          {article.title}
                        </h2>
                        <p className="text-lg md:text-xl text-gray-200 mb-6 line-clamp-3">
                          {article.excerpt}
                        </p>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-300">
                            {article.publishedAt && new Date(article.publishedAt).toLocaleDateString('ar-LB', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                          <span className="text-purple-300 font-medium">اقرأ المزيد →</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
              
              {/* Navigation dots */}
              {featuredArticles.length > 1 && (
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
                  {featuredArticles.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.preventDefault();
                        setIsTransitioning(true);
                        setTimeout(() => {
                          setCurrentFeaturedIndex(index);
                          setIsTransitioning(false);
                        }, 500);
                      }}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentFeaturedIndex
                          ? 'bg-white w-8'
                          : 'bg-white/50 hover:bg-white/75'
                      }`}
                      aria-label={`Go to featured article ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Latest Articles */}
        <div className="space-y-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">آخر المقالات</h2>
            <p className="text-gray-600">اكتشف أحدث المقالات والتقارير</p>
          </div>
          
          {loadingArticles ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="border border-gray-200 rounded-xl overflow-hidden bg-white animate-pulse">
                  <div className="aspect-video bg-gray-200"></div>
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-5 bg-gray-200 rounded w-full"></div>
                    <div className="h-5 bg-gray-200 rounded w-4/5"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : articles.length > 0 ? (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {articles.map((article, index) => (
                  <Link
                    key={article._id}
                    href={`/article/${article.slug}`}
                    className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {article.featuredImage && (
                      <div className="aspect-video overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 relative">
                        <img
                          src={getImageUrl(article.featuredImage)}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            console.error('Image failed to load:', getImageUrl(article.featuredImage));
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                    )}
                    <div className="p-5 space-y-3">
                      <div
                        className="inline-block px-3 py-1.5 text-xs font-semibold rounded-full text-white shadow-sm"
                        style={{ backgroundColor: article.category.color }}
                      >
                        {article.category.name}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-purple-600 transition-colors leading-tight">
                        {article.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">{article.excerpt}</p>
                      {article.publishedAt && (
                        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <time className="text-xs text-gray-500" dateTime={article.publishedAt}>
                            {new Date(article.publishedAt).toLocaleDateString('ar-LB', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </time>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
              <div className="text-center pt-4">
                <Link
                  href="/search"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <span>عرض جميع المقالات</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-gray-500 text-lg">لا توجد مقالات متاحة حالياً</p>
            </div>
          )}
        </div>

        {/* Category Preview Section */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">التصنيفات</h2>
            <p className="text-gray-600">استكشف المحتوى حسب المواضيع</p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <CategoryCard
              name="البيئة والمناخ"
              description="ثروة طبيعية، زراعة وأرض، طاقة واستدامة"
              color="var(--color-environment)"
              delay={0}
              slug="environment-climate"
            />
            <CategoryCard
              name="شؤون الناس"
              description="قضايا المجتمع والحياة اليومية"
              color="var(--color-society)"
              delay={0.1}
              slug="society"
            />
            <CategoryCard
              name="اقتصاد ومعيشة"
              description="الأخبار الاقتصادية وتأثيرها على المعيشة"
              color="var(--color-economy)"
              delay={0.2}
              slug="economy"
            />
            <CategoryCard
              name="تربية وتعليم"
              description="التعليم والشباب والمستقبل"
              color="var(--color-education)"
              delay={0.3}
              slug="education"
            />
            <CategoryCard
              name="تكنولوجيا وابتكار"
              description="التقنية والابتكار في لبنان والعالم"
              color="var(--color-tech)"
              delay={0.4}
              slug="tech"
            />
            <CategoryCard
              name="صحة وحياة"
              description="الصحة العامة وأسلوب الحياة"
              color="var(--color-health)"
              delay={0.5}
              slug="health"
            />
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

function CategoryCard({
  name,
  description,
  color,
  delay,
  slug,
}: {
  name: string;
  description: string;
  color: string;
  delay: number;
  slug: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-scale-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  return (
    <Link href={`/category/${slug}`}>
      <div
        ref={cardRef}
        className="group relative rounded-xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 cursor-pointer overflow-hidden"
        style={{ 
          borderRightWidth: "5px", 
          borderRightColor: color,
          animationDelay: `${delay}s`,
        }}
      >
        {/* Animated background gradient on hover */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
          style={{ 
            background: `linear-gradient(135deg, ${color} 0%, transparent 100%)`,
          }}
        ></div>
        
        {/* Color indicator dot */}
        <div 
          className="absolute top-4 left-4 w-3 h-3 rounded-full shadow-sm"
          style={{ backgroundColor: color }}
        ></div>
        
        {/* Content */}
        <div className="relative z-10 pr-4">
          <h3 className="mb-3 text-xl font-bold text-gray-900 transition-colors duration-300 group-hover:scale-105 inline-block">
            {name}
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed transition-colors duration-300">
            {description}
          </p>
          
          {/* Arrow icon */}
          <div className="mt-4 flex items-center gap-2 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ color }}>
            <span>استكشف</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </div>
        </div>
        
        {/* Animated border accent */}
        <div 
          className="absolute top-0 right-0 w-1 h-0 group-hover:h-full transition-all duration-500 rounded-r-xl"
          style={{ backgroundColor: color }}
        ></div>
      </div>
    </Link>
  );
}
