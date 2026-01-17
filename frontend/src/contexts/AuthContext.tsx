'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'contributor' | 'user';
  profilePicture?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (token exists in localStorage)
    const loadUser = async () => {
      const token = api.getToken();
      if (token) {
        // Token exists, fetch user info from backend
        try {
          const response = await api.get<any>('/users/me');
          if (response.success && response.data) {
            const userData = response.data;
            setUser({
              id: userData._id?.toString() || userData.id,
              email: userData.email,
              name: userData.name,
              role: userData.role,
              profilePicture: userData.profilePicture,
            });
          } else {
            // Token is invalid, remove it
            api.setToken(null);
            setUser(null);
          }
        } catch (err) {
          // Token is invalid, remove it
          // Silently fail - token may be expired
          api.setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    
    loadUser();

    // Listen for 401 unauthorized events from API client
    const handleUnauthorized = () => {
      api.setToken(null);
      setUser(null);
    };
    
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post<{ user: User; token: string }>('/auth/login', {
        email,
        password,
      });

      if (response.success && response.data) {
        api.setToken(response.data.token);
        setUser(response.data.user);
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Login failed' };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred during login',
      };
    }
  };

  const logout = () => {
    api.setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

