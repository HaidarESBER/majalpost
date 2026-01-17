'use client';

import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/admin/ProtectedRoute';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  return (
    <AuthProvider>
      {isLoginPage ? (
        // Login page - no protection, no admin layout
        <>{children}</>
      ) : (
        // Other admin pages - protected with admin layout
        <ProtectedRoute>
          <AdminLayout>{children}</AdminLayout>
        </ProtectedRoute>
      )}
    </AuthProvider>
  );
}

