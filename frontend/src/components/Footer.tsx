'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
          }
        });
      },
      { threshold: 0.1 }
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => {
      if (footerRef.current) {
        observer.unobserve(footerRef.current);
      }
    };
  }, []);

  return (
    <footer 
      ref={footerRef}
      className="bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white border-t border-gray-700 mt-auto"
    >
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
          {/* About Section with animation */}
          <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 flex-shrink-0">
                <img
                  src="/majalnobg.png"
                  alt="مجال بوست"
                  className="w-full h-full object-contain"
                />
              </div>
              <h3 className="text-xl font-bold">عن مجال بوست</h3>
            </div>
            <p className="text-gray-300 leading-relaxed text-sm">
              منصة إعلامية لبنانية مستقلة تركز على قضايا البيئة، الاقتصاد، والمجتمع
              بعيداً عن الضجيج السياسي.
            </p>
          </div>

          {/* Links Section with animation */}
          <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-xl font-bold mb-6">روابط سريعة</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/about" 
                  className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-all duration-300 hover:translate-x-[-4px] group"
                >
                  <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span>عن مجال بوست</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact" 
                  className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-all duration-300 hover:translate-x-[-4px] group"
                >
                  <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span>تواصل معنا</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/become-contributor"
                  className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-all duration-300 hover:translate-x-[-4px] group"
                >
                  <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span>ساهم معنا</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Social & Contact Section with enhanced animations */}
          <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <h3 className="text-xl font-bold mb-6">تابعنا</h3>
            <div className="flex items-center gap-4 mb-6">
              <a
                href="https://www.facebook.com/share/1CC9zdNJCc/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white transition-all duration-300 hover:bg-blue-700 hover:scale-110 hover:shadow-xl active:scale-95"
                aria-label="فيسبوك"
              >
                <svg className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a
                href="https://www.instagram.com/majalpost?igsh=MThkN3RlMDA0eWt1cg=="
                target="_blank"
                rel="noopener noreferrer"
                className="group relative w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 flex items-center justify-center text-white transition-all duration-300 hover:scale-110 hover:shadow-xl active:scale-95"
                aria-label="انستغرام"
              >
                <svg className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>ساهم معنا</span>
            </Link>
          </div>
        </div>

        {/* Copyright with animation */}
        <div className="mt-12 pt-8 border-t border-gray-700 text-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <p className="text-sm text-gray-400 transition-colors duration-300 hover:text-gray-300">
            &copy; {new Date().getFullYear()} مجال بوست - جميع الحقوق محفوظة
          </p>
        </div>
      </div>
    </footer>
  );
}

