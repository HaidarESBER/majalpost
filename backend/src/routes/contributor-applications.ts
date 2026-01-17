import { Router, Response } from 'express';
import { ContributorApplication, ApplicationStatus } from '../models/ContributorApplication.js';
import { User, UserRole } from '../models/User.js';
import { ApiResponse } from '../types/index.js';
import { ApiError, HttpStatus } from '../types/index.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { sendContributorApprovalEmail, sendContributorRejectionEmail } from '../utils/emailService.js';
import { validateObjectId } from '../utils/validation.js';

const router = Router();

/**
 * PUBLIC ROUTES
 */

/**
 * Submit a contributor application
 * POST /api/contributor-applications
 * Body: { message }
 */
router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { message } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      throw new ApiError('Authentication required', HttpStatus.UNAUTHORIZED);
    }

    if (!message || !message.trim()) {
      throw new ApiError('Message is required', HttpStatus.BAD_REQUEST);
    }

    // Check if user already has a pending application
    const existingApplication = await ContributorApplication.findOne({
      user: userId,
      status: ApplicationStatus.PENDING,
    });

    if (existingApplication) {
      throw new ApiError('You already have a pending application', HttpStatus.CONFLICT);
    }

    // Check if user is already a contributor or higher
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError('User not found', HttpStatus.NOT_FOUND);
    }

    if (user.role === UserRole.CONTRIBUTOR || user.role === UserRole.EDITOR || user.role === UserRole.ADMIN) {
      throw new ApiError('You are already a contributor or higher', HttpStatus.BAD_REQUEST);
    }

    // Create application
    const application = new ContributorApplication({
      user: userId,
      message: message.trim(),
      status: ApplicationStatus.PENDING,
    });

    await application.save();

    await application.populate('user', 'name email');

    const response: ApiResponse = {
      success: true,
      data: application.toObject(),
      message: 'Application submitted successfully',
    };

    res.status(HttpStatus.CREATED).json(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof Error && error.name === 'ValidationError') {
      throw new ApiError(error.message, HttpStatus.BAD_REQUEST);
    }
    throw error;
  }
});

/**
 * Get user's own applications (if authenticated)
 * GET /api/contributor-applications/my-applications
 */
router.get('/my-applications', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw new ApiError('Authentication required', HttpStatus.UNAUTHORIZED);
    }

    const applications = await ContributorApplication.find({ user: userId })
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    const response: ApiResponse<typeof applications> = {
      success: true,
      data: applications,
    };

    res.json(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw error;
  }
});

/**
 * PROTECTED ADMIN ROUTES
 */

/**
 * Get all applications (admin only)
 * GET /api/contributor-applications
 * Query params: ?status=pending&page=1&limit=20
 */
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userRole = req.user?.role;

    if (userRole !== 'admin' && userRole !== 'editor') {
      throw new ApiError('Admin access required', HttpStatus.FORBIDDEN);
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const { status } = req.query;

    const filter: Record<string, unknown> = {};
    if (status) {
      filter.status = status;
    }

    const skip = (page - 1) * limit;

    const [applications, total] = await Promise.all([
      ContributorApplication.find(filter)
        .populate('user', 'name email profilePicture')
        .populate('reviewedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ContributorApplication.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    const response: ApiResponse<{
      items: typeof applications;
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    }> = {
      success: true,
      data: {
        items: applications,
        pagination: {
          total,
          page,
          limit,
          totalPages,
        },
      },
    };

    res.json(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw error;
  }
});

/**
 * Get single application by ID (admin only)
 * GET /api/contributor-applications/:id
 */
router.get('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userRole = req.user?.role;

    if (userRole !== 'admin' && userRole !== 'editor') {
      throw new ApiError('Admin access required', HttpStatus.FORBIDDEN);
    }

    const { id } = req.params;

    // Validate ObjectId
    validateObjectId(id, 'Application ID');

    const application = await ContributorApplication.findById(id)
      .populate('user', 'name email profilePicture')
      .populate('reviewedBy', 'name email')
      .lean();

    if (!application) {
      throw new ApiError('Application not found', HttpStatus.NOT_FOUND);
    }

    const response: ApiResponse<typeof application> = {
      success: true,
      data: application,
    };

    res.json(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw error;
  }
});

/**
 * Update application status (approve/reject) - admin only
 * PUT /api/contributor-applications/:id
 * Body: { status: 'approved' | 'rejected', reviewNotes?: string }
 */
router.put('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userRole = req.user?.role;
    const reviewerId = req.user?.userId;

    if (userRole !== 'admin' && userRole !== 'editor') {
      throw new ApiError('Admin access required', HttpStatus.FORBIDDEN);
    }

    if (!reviewerId) {
      throw new ApiError('Authentication required', HttpStatus.UNAUTHORIZED);
    }

    const { id } = req.params;
    const { status, reviewNotes } = req.body;

    // Validate ObjectId
    validateObjectId(id, 'Application ID');

    if (!status || (status !== ApplicationStatus.APPROVED && status !== ApplicationStatus.REJECTED)) {
      throw new ApiError('Status must be approved or rejected', HttpStatus.BAD_REQUEST);
    }

    const application = await ContributorApplication.findById(id);

    if (!application) {
      throw new ApiError('Application not found', HttpStatus.NOT_FOUND);
    }

    if (application.status !== ApplicationStatus.PENDING) {
      throw new ApiError('Application has already been reviewed', HttpStatus.BAD_REQUEST);
    }

    // Update application
    application.status = status as ApplicationStatus;
    application.reviewedBy = reviewerId as any;
    application.reviewedAt = new Date();
    if (reviewNotes) {
      application.reviewNotes = reviewNotes.trim();
    }

    await application.save();

    // Populate user for email sending
    await application.populate('user', 'name email profilePicture');

    // If approved, update user role to contributor
    if (status === ApplicationStatus.APPROVED) {
      const user = await User.findById(application.user);
      if (user && user.role !== UserRole.CONTRIBUTOR && user.role !== UserRole.EDITOR && user.role !== UserRole.ADMIN) {
        user.role = UserRole.CONTRIBUTOR;
        await user.save();
      }
      // Send approval email
      const userDoc = application.user as any;
      sendContributorApprovalEmail(userDoc.email, userDoc.name, reviewNotes).catch((error) => {
        console.error('Failed to send contributor approval email:', error);
      });
    } else {
      // Send rejection email
      const userDoc = application.user as any;
      sendContributorRejectionEmail(userDoc.email, userDoc.name, reviewNotes).catch((error) => {
        console.error('Failed to send contributor rejection email:', error);
      });
    }

    await application.populate('reviewedBy', 'name email');

    const response: ApiResponse = {
      success: true,
      data: application.toObject(),
      message: `Application ${status === ApplicationStatus.APPROVED ? 'approved' : 'rejected'} successfully`,
    };

    res.json(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw error;
  }
});

export default router;

