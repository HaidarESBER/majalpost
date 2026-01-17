'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const categories = [
  { name: 'البيئة والمناخ', slug: 'environment', color: 'var(--color-environment)' },
  { name: 'شؤون الناس', slug: 'society', color: 'var(--color-society)' },
  { name: 'اقتصاد ومعيشة', slug: 'economy', color: 'var(--color-economy)' },
  { name: 'تربية وتعليم', slug: 'education', color: 'var(--color-education)' },
  { name: 'تكنولوجيا وابتكار', slug: 'tech', color: 'var(--color-tech)' },
  { name: 'صحة وحياة', slug: 'health', color: 'var(--color-health)' },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSearchClick = () => {
    router.push('/search');
  };

  return (
    <header 
      className={`sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b transition-all duration-300 ${
        isScrolled ? 'shadow-lg border-gray-200/50' : 'shadow-sm border-gray-200'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo with animation */}
          <Link 
            href="/" 
            className="flex items-center gap-2.5 md:gap-3 group animate-fade-in"
          >
            <div className="relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0 transition-all duration-300 group-hover:scale-105 group-hover:brightness-110">
              <img
                src="/majalnobg.png"
                alt="مجال بوست"
                className="w-full h-full object-contain drop-shadow-md"
              />
            </div>
            <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent transition-all duration-300 whitespace-nowrap">
              مجال بوست
            </span>
          </Link>

          {/* Desktop Navigation with enhanced animations */}
          <nav className="hidden md:flex items-center space-x-1 space-x-reverse">
            {categories.map((category, index) => (
              <Link
                key={category.slug}
                href={`/category/${category.slug}`}
                className="relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-gray-100/80 hover:scale-105 group overflow-hidden"
                style={{ 
                  borderRight: `3px solid ${category.color}`,
                  paddingRight: '1rem',
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                <span className="relative z-10 transition-colors duration-300 group-hover:text-gray-900">
                  {category.name}
                </span>
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                  style={{ backgroundColor: category.color }}
                ></div>
              </Link>
            ))}
          </nav>

          {/* Right Side Actions - Desktop */}
          <div className="hidden md:flex items-center gap-3">
            {/* Search Button */}
            <button
              onClick={handleSearchClick}
              className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 text-gray-700 hover:text-purple-600"
              aria-label="بحث"
            >
              <svg
                className="w-5 h-5 transition-transform duration-300 hover:scale-110"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                >
                  {user?.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-700 hidden lg:inline">{user?.name}</span>
                  <svg
                    className={`w-4 h-4 text-gray-500 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    <div className="absolute left-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-20">
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                      <Link
                        href="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        الملف الشخصي
                      </Link>
                      {user?.role === 'contributor' && (
                        <Link
                          href="/my-articles"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="block w-full text-right px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 transition-colors font-medium"
                        >
                          مقالاتي
                        </Link>
                      )}
                      {(user?.role === 'editor' || user?.role === 'admin') && (
                        <Link
                          href="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="block w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          لوحة التحكم
                        </Link>
                      )}
                      {user && user.role !== 'contributor' && user.role !== 'editor' && user.role !== 'admin' && (
                        <Link
                          href="/become-contributor"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="block w-full text-right px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 transition-colors"
                        >
                          التقديم كمساهم
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                          router.push('/');
                        }}
                        className="w-full text-right px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        تسجيل الخروج
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  تسجيل الدخول
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  إنشاء حساب
                </Link>
              </div>
            )}
          </div>

          {/* Mobile: Search and Menu Buttons */}
          <div className="md:hidden flex items-center space-x-2 space-x-reverse">
            {/* Auth Buttons - Mobile */}
            {isAuthenticated ? (
              <div className="p-2.5 rounded-lg">
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-xs">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="px-3 py-2 text-xs font-medium text-purple-600 hover:text-purple-700"
              >
                دخول
              </Link>
            )}

            {/* Search Button - Mobile */}
            <button
              onClick={handleSearchClick}
              className="p-2.5 rounded-lg hover:bg-gray-100 transition-all duration-300 active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              aria-label="بحث"
            >
              <svg
                className="w-6 h-6 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>

            {/* Enhanced Animated Hamburger Menu Button */}
            <button
              onClick={toggleMenu}
              className="p-2.5 rounded-lg hover:bg-gray-100 transition-all duration-300 active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              aria-label="القائمة"
              aria-expanded={isMenuOpen}
            >
              <div className="w-6 h-6 relative">
                <span
                  className={`absolute top-0 right-0 w-6 h-0.5 bg-gray-800 rounded-full transition-all duration-300 ${
                    isMenuOpen ? 'rotate-45 translate-y-2.5' : ''
                  }`}
                />
                <span
                  className={`absolute top-2.5 right-0 w-6 h-0.5 bg-gray-800 rounded-full transition-all duration-300 ${
                    isMenuOpen ? 'opacity-0' : 'opacity-100'
                  }`}
                />
                <span
                  className={`absolute bottom-0 right-0 w-6 h-0.5 bg-gray-800 rounded-full transition-all duration-300 ${
                    isMenuOpen ? '-rotate-45 -translate-y-2.5' : ''
                  }`}
                />
              </div>
            </button>
        </div>
        </div>
      </div>

      {/* Enhanced Mobile Navigation with smooth animations */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <nav className="border-t border-gray-200 bg-white/98 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-3">
            {categories.map((category, index) => (
              <Link
                key={category.slug}
                href={`/category/${category.slug}`}
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-3 rounded-lg transition-all duration-300 hover:bg-gray-100/80 hover:translate-x-[-4px] active:scale-95 group relative overflow-hidden"
                style={{ 
                  borderRight: `3px solid ${category.color}`,
                  paddingRight: '1rem',
                  animationDelay: `${index * 0.05}s`,
                }}
              >
                <span className="relative z-10 transition-colors duration-300 group-hover:text-gray-900">
                  {category.name}
                </span>
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300"
                  style={{ backgroundColor: category.color }}
                ></div>
              </Link>
            ))}
            
            {/* Auth Links - Mobile */}
            {!isAuthenticated && (
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                <Link
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-center font-medium text-gray-700"
                >
                  تسجيل الدخول
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors text-center font-medium text-white"
                >
                  إنشاء حساب
                </Link>
              </div>
            )}
            {isAuthenticated && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="px-4 py-2 mb-2">
                  <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
                {user?.role === 'contributor' && (
                  <Link
                    href="/my-articles"
                    onClick={() => setIsMenuOpen(false)}
                    className="block w-full px-4 py-3 mb-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors text-center font-medium text-white"
                  >
                    مقالاتي
                  </Link>
                )}
                {(user?.role === 'editor' || user?.role === 'admin') && (
                  <Link
                    href="/admin"
                    onClick={() => setIsMenuOpen(false)}
                    className="block w-full px-4 py-3 mb-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-center font-medium text-gray-700"
                  >
                    لوحة التحكم
                  </Link>
                )}
                {user && user.role !== 'contributor' && user.role !== 'editor' && user.role !== 'admin' && (
                  <Link
                    href="/become-contributor"
                    onClick={() => setIsMenuOpen(false)}
                    className="block w-full px-4 py-3 mb-2 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors text-center font-medium text-purple-600"
                  >
                    التقديم كمساهم
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                    router.push('/');
                  }}
                  className="w-full px-4 py-3 rounded-lg bg-red-50 hover:bg-red-100 transition-colors text-center font-medium text-red-600"
                >
                  تسجيل الخروج
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

