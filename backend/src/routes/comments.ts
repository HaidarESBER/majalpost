import { Router, Response } from 'express';
import { Comment } from '../models/Comment.js';
import { Article } from '../models/Article.js';
import { ApiResponse } from '../types/index.js';
import { ApiError, HttpStatus } from '../types/index.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { sanitizeHtml } from '../utils/sanitize.js';
import { generalLimiter } from '../middleware/rateLimit.js';
import { validateObjectId } from '../utils/validation.js';

const router = Router();

/**
 * Get comments for an article (public)
 * GET /api/comments?article={articleId}
 */
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { article } = req.query;

    if (!article || typeof article !== 'string') {
      throw new ApiError('Article ID is required', HttpStatus.BAD_REQUEST);
    }

    // Validate ObjectId
    validateObjectId(article, 'Article ID');

    const comments = await Comment.find({ article })
      .populate('author', 'name email profilePicture')
      .sort({ createdAt: -1 })
      .lean();

    const response: ApiResponse<typeof comments> = {
      success: true,
      data: comments,
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
 * Create a new comment
 * POST /api/comments
 * Body: { content, article }
 */
router.post('/', authenticate, generalLimiter, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { content, article } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      throw new ApiError('Authentication required', HttpStatus.UNAUTHORIZED);
    }

    // Validation
    if (!content || !article) {
      throw new ApiError('Content and article ID are required', HttpStatus.BAD_REQUEST);
    }

    // Validate ObjectId
    validateObjectId(article, 'Article ID');

    // Verify article exists
    const articleDoc = await Article.findById(article);
    if (!articleDoc) {
      throw new ApiError('Article not found', HttpStatus.NOT_FOUND);
    }

    // Sanitize HTML content
    const sanitizedContent = sanitizeHtml(content);

    // Create comment
    const comment = new Comment({
      content: sanitizedContent,
      article,
      author: userId,
    });

    await comment.save();

    // Populate author info
    await comment.populate('author', 'name email profilePicture');

    const response: ApiResponse = {
      success: true,
      data: comment.toObject(),
      message: 'Comment created successfully',
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
 * Update a comment
 * PUT /api/comments/:id
 * Body: { content }
 */
router.put('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      throw new ApiError('Authentication required', HttpStatus.UNAUTHORIZED);
    }

    if (!content) {
      throw new ApiError('Content is required', HttpStatus.BAD_REQUEST);
    }

    // Validate ObjectId
    const commentId = Array.isArray(id) ? id[0] : id;
    validateObjectId(commentId, 'Comment ID');

    const comment = await Comment.findById(commentId);

    if (!comment) {
      throw new ApiError('Comment not found', HttpStatus.NOT_FOUND);
    }

    // Check if user is the author
    if (comment.author.toString() !== userId) {
      throw new ApiError('You can only edit your own comments', HttpStatus.FORBIDDEN);
    }

    // Sanitize HTML content
    comment.content = sanitizeHtml(content);
    await comment.save();

    await comment.populate('author', 'name email profilePicture');

    const response: ApiResponse = {
      success: true,
      data: comment.toObject(),
      message: 'Comment updated successfully',
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
 * Delete a comment
 * DELETE /api/comments/:id
 */
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      throw new ApiError('Authentication required', HttpStatus.UNAUTHORIZED);
    }

    // Validate ObjectId
    const commentId = Array.isArray(id) ? id[0] : id;
    validateObjectId(commentId, 'Comment ID');

    const comment = await Comment.findById(commentId);

    if (!comment) {
      throw new ApiError('Comment not found', HttpStatus.NOT_FOUND);
    }

    // Check if user is the author or admin
    const userRole = req.user?.role;
    if (comment.author.toString() !== userId && userRole !== 'admin' && userRole !== 'editor') {
      throw new ApiError('You can only delete your own comments', HttpStatus.FORBIDDEN);
    }

    await Comment.deleteOne({ _id: commentId });

    res.status(HttpStatus.NO_CONTENT).send();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw error;
  }
});

export default router;

