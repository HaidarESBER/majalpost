import { API_URL } from './config';
import type { ApiResponse, SearchResponse } from '@shared/types';

/**
 * Typed API client for frontend-backend communication
 */
class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    // Load token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  /**
   * Set authentication token
   */
  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token);
      } else {
        localStorage.removeItem('auth_token');
      }
    }
  }

  /**
   * Get authentication token
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * Generic fetch wrapper with error handling
   */
  private async fetch<T>(path: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options?.headers as Record<string, string>),
      };

      // Add authorization header if token exists
      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }

      const response = await fetch(`${this.baseUrl}${path}`, {
        ...options,
        headers,
      });

      // Handle 204 No Content responses (common for DELETE operations)
      if (response.status === 204) {
        return {
          success: true,
        } as ApiResponse<T>;
      }

      // Handle empty responses
      const text = await response.text();
      if (!text) {
        if (response.ok) {
          return {
            success: true,
          } as ApiResponse<T>;
        } else {
          return {
            success: false,
            error: `HTTP ${response.status}`,
          };
        }
      }

      const data: ApiResponse<T> = JSON.parse(text);

      // Handle 401 Unauthorized - clear token and trigger logout
      if (response.status === 401) {
        this.setToken(null);
        // Dispatch custom event for auth context to handle
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        }
        throw new Error(data.error || data.message || 'Authentication required');
      }

      if (!response.ok) {
        throw new Error(data.error || data.message || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: 'Unknown error occurred',
      };
    }
  }

  /**
   * GET request
   */
  async get<T>(path: string): Promise<ApiResponse<T>> {
    return this.fetch<T>(path, { method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(path: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.fetch<T>(path, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(path: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.fetch<T>(path, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(path: string): Promise<ApiResponse<T>> {
    return this.fetch<T>(path, { method: 'DELETE' });
  }

  /**
   * Search articles
   * GET /api/search?q={query}&limit={limit}&offset={offset}&category={category}
   */
  async searchArticles(
    query: string,
    options?: { limit?: number; offset?: number; category?: string }
  ): Promise<ApiResponse<SearchResponse>> {
    const params = new URLSearchParams();
    params.set('q', query);
    
    if (options?.limit !== undefined) {
      params.set('limit', options.limit.toString());
    }
    if (options?.offset !== undefined) {
      params.set('offset', options.offset.toString());
    }
    if (options?.category) {
      params.set('category', options.category);
    }
    
    return this.get<SearchResponse>(`/search?${params.toString()}`);
  }
}

// Export singleton instance
export const api = new ApiClient(API_URL);

