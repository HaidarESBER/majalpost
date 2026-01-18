import { Router, Request, Response } from 'express';
import { ApiResponse } from '../types/index.js';
import authRoutes from './auth.js';
import categoryRoutes from './categories.js';
import tagRoutes from './tags.js';
import searchRoutes from './search.js';
import mediaRoutes from './media.js';
import articleRoutes from './articles.js';
import commentRoutes from './comments.js';
import contributorApplicationRoutes from './contributor-applications.js';
import userRoutes from './users.js';
import testRoutes from './test.js';

const router = Router();

/**
 * Root API endpoint - basic info
 * GET /api
 */
router.get('/', async (req: Request, res: Response) => {
  const response: ApiResponse<{ message: string; version: string; endpoints: string[] }> = {
    success: true,
    data: {
      message: 'Majal Post API',
      version: '1.0.0',
      endpoints: ['/health', '/auth', '/articles', '/categories', '/tags', '/comments', '/media', '/users', '/search'],
    },
  };
  res.json(response);
});

/**
 * Health check endpoint
 * GET /api/health
 */
router.get('/health', async (req: Request, res: Response) => {
  const mongoose = await import('mongoose');
  const dbStatus = mongoose.default.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  const response: ApiResponse<{ status: string; timestamp: string; database: string }> = {
    success: true,
    data: {
      status: dbStatus === 'connected' ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      database: dbStatus,
    },
  };
  res.json(response);
});

/**
 * API root - returns API info
 * GET /api
 */
router.get('/', (req: Request, res: Response) => {
  const response: ApiResponse<{ name: string; version: string }> = {
    success: true,
    data: {
      name: 'Majal Post API',
      version: '1.0.0',
    },
  };
  res.json(response);
});

/**
 * Auth routes
 * /api/auth/*
 */
router.use('/auth', authRoutes);

/**
 * Category routes
 * /api/categories/*
 */
router.use('/categories', categoryRoutes);

/**
 * Tag routes
 * /api/tags/*
 */
router.use('/tags', tagRoutes);

/**
 * Search routes
 * /api/search/*
 */
router.use('/search', searchRoutes);

/**
 * Media routes
 * /api/media/*
 */
router.use('/media', mediaRoutes);

/**
 * Article routes
 * /api/articles/*
 */
router.use('/articles', articleRoutes);

/**
 * Comment routes
 * /api/comments/*
 */
router.use('/comments', commentRoutes);

/**
 * Contributor application routes
 * /api/contributor-applications/*
 */
router.use('/contributor-applications', contributorApplicationRoutes);

/**
 * User routes
 * /api/users/*
 */
router.use('/users', userRoutes);

/**
 * Test routes (admin/editor only)
 * /api/test/*
 */
router.use('/test', testRoutes);

export default router;
