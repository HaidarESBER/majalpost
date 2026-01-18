import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { requireAdminOrEditor } from '../middleware/authorize.js';
import { sendWelcomeEmail } from '../utils/emailService.js';
import { ApiResponse, ApiError, HttpStatus } from '../types/index.js';

const router = Router();

/**
 * Test email sending
 * POST /api/test/email
 * Body: { email?: string, name?: string }
 * Requires: Admin or Editor authentication
 */
router.post('/email', authenticate, requireAdminOrEditor, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, name } = req.body;
    const testEmail = email || req.user?.email || 'test@example.com';
    const testName = name || 'Test User';

    if (!testEmail || !testName) {
      throw new ApiError('Email and name are required', HttpStatus.BAD_REQUEST);
    }

    console.log('Testing email send...', { to: testEmail, name: testName });

    // Send test welcome email
    await sendWelcomeEmail(testEmail, testName);

    const response: ApiResponse<{ message: string; sentTo: string }> = {
      success: true,
      data: {
        message: 'Test email sent successfully',
        sentTo: testEmail,
      },
    };

    res.json(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error('Test email error:', error);
    throw new ApiError(
      `Failed to send test email: ${error instanceof Error ? error.message : 'Unknown error'}`,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
});

export default router;

