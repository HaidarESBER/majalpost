/**
 * Standard API response wrapper
 * Used by both frontend and backend for consistent response format
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * API error details
 */
export interface ApiErrorDetails {
  message: string;
  statusCode: number;
  details?: Record<string, unknown>;
}

/**
 * Paginated response wrapper
 * For endpoints returning lists with pagination
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Search-related API types
 */

import type { BaseEntity } from './models.js';

/**
 * Search result item (individual article from search)
 */
export interface SearchResult extends BaseEntity {
  title: string;
  excerpt: string;
  slug: string;
  featuredImage?: string;
  category: {
    _id: string;
    name: string;
    slug: string;
    color?: string;
  };
  tags: Array<{
    _id: string;
    name: string;
    slug: string;
  }>;
  author: {
    _id: string;
    name: string;
  };
  publishedAt: Date | string;
  score?: number; // Text search relevance score
}

/**
 * Search response with pagination metadata
 */
export interface SearchResponse {
  results: SearchResult[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}
