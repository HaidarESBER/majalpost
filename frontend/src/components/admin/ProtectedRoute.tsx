'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!loading) {
      const token = api.getToken();
      
      // No token = not authenticated, redirect to login
      if (!token) {
        router.push('/admin/login');
        return;
      }

      // Token exists but no user data = authentication failed, redirect to login
      if (!user) {
        router.push('/admin/login');
        return;
      }

      // User data exists - check role
      if (user.role !== 'admin' && user.role !== 'editor') {
        router.push('/');
        return;
      }

      // User is admin or editor - allow access
      setChecking(false);
    }
  }, [loading, user, router]);

  // Show loading while auth context is loading or we're checking user role
  if (loading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Final security check: if user exists but is not admin/editor, redirect
  if (user && user.role !== 'admin' && user.role !== 'editor') {
    return null; // Redirect is handled in useEffect
  }

  // Final security check: if no token, don't render
  const token = api.getToken();
  if (!token) {
    return null; // Redirect is handled in useEffect
  }

  return <>{children}</>;
}

