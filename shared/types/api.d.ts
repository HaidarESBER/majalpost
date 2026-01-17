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
//# sourceMappingURL=api.d.ts.map