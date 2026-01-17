import { Router, Request, Response } from 'express';
import { ApiResponse } from '../types/index.js';

const router = Router();

/**
 * Health check endpoint
 * GET /api/health
 */
router.get('/health', (req: Request, res: Response) => {
  const response: ApiResponse<{ status: string; timestamp: string }> = {
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
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

export default router;
