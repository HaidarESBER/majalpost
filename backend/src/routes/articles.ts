import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { Article, ArticleStatus } from '../models/Article.js';
import { ApiResponse } from '../types/index.js';
import { ApiError, HttpStatus } from '../types/index.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { sendArticlePendingReviewEmail, sendArticleApprovalEmail, sendArticleRejectionEmail } from '../utils/emailService.js';
import { sanitizeHtml, sanitizeText } from '../utils/sanitize.js';

const router = Router();

/**
 * Generate slug from title
 */
function generateSlug(title: string): string {
  let slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  // If slug is empty (e.g., Arabic-only title), generate a fallback
  if (!slug || slug.trim() === '') {
    // Generate a slug from timestamp as fallback
    slug = `article-${Date.now()}`;
  }
  
  return slug;
}

/**
 * PUBLIC ROUTES (no authentication required)
 */

/**
 * Get published articles (public)
 * GET /api/articles/public
 * Query params: ?page=1&limit=20&category={slug}
 */
router.get('/public', async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const { category } = req.query;

    const filter: Record<string, unknown> = {
      isPublished: true, // Only published articles
      status: ArticleStatus.PUBLISHED,
    };

    const skip = (page - 1) * limit;

    // If category filter is provided, convert slug to ObjectId
    if (category) {
      const { Category } = await import('../models/Category.js');
      const categoryDoc = await Category.findOne({ slug: category });
      if (categoryDoc) {
        filter.category = categoryDoc._id;
      }
    }

    const [articles, total] = await Promise.all([
      Article.find(filter)
        .populate('category', 'name nameEn slug color')
        .populate('tags', 'name slug')
        .populate('author', 'name')
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Article.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    const response: ApiResponse<{
      items: typeof articles;
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    }> = {
      success: true,
      data: {
        items: articles,
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
    throw error;
  }
});

/**
 * Get single published article by slug (public)
 * GET /api/articles/public/:slug
 */
router.get('/public/:slug', async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;

    const article = await Article.findOne({ slug, isPublished: true, status: ArticleStatus.PUBLISHED });

    if (!article) {
      throw new ApiError('Article not found', HttpStatus.NOT_FOUND);
    }

    // Increment view count
    article.views = (article.views || 0) + 1;
    await article.save();

    await article.populate('category', 'name nameEn slug color');
    await article.populate('tags', 'name slug');
    await article.populate('author', 'name profilePicture');
    await article.populate('likes', 'name');

    const response: ApiResponse<Record<string, unknown>> = {
      success: true,
      data: article.toObject() as unknown as Record<string, unknown>,
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
 * PROTECTED ROUTES (require authentication)
 */

// All routes below require authentication
router.use(authenticate);

/**
 * Get all articles (admin - includes drafts)
 * GET /api/articles
 * Query params: ?page=1&limit=20&isPublished=true&category={slug}&author={id}
 * For contributors: returns only their own articles
 */
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const { isPublished, category, author } = req.query;
    const userRole = req.user?.role;
    const userId = req.user?.userId;

    const filter: Record<string, unknown> = {};
    
    // Contributors can only see their own articles
    if (userRole === 'contributor' && userId) {
      filter.author = userId;
    } else if (author) {
      filter.author = author;
    }
    
    if (isPublished !== undefined) {
      filter.isPublished = isPublished === 'true';
    }

    const skip = (page - 1) * limit;

    // If category filter is provided, convert slug to ObjectId
    if (category) {
      const { Category } = await import('../models/Category.js');
      const categoryDoc = await Category.findOne({ slug: category });
      if (categoryDoc) {
        filter.category = categoryDoc._id;
      }
    }

    const [articles, total] = await Promise.all([
      Article.find(filter)
        .populate('category', 'name nameEn slug color')
        .populate('tags', 'name slug')
        .populate('author', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Article.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    const response: ApiResponse<{
      items: typeof articles;
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    }> = {
      success: true,
      data: {
        items: articles,
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
    throw error;
  }
});

/**
 * Get single article by slug (admin - can access drafts)
 * GET /api/articles/:slug
 */
router.get('/:slug', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;

    const article = await Article.findOne({ slug })
      .populate('category', 'name nameEn slug color')
      .populate('tags', 'name slug')
      .populate('author', 'name email')
      .lean();

    if (!article) {
      throw new ApiError('Article not found', HttpStatus.NOT_FOUND);
    }

    const response: ApiResponse<typeof article> = {
      success: true,
      data: article,
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
 * Create new article
 * POST /api/articles
 * Body: { title, excerpt, content, category, tags, featuredImage, isPublished, publishedAt }
 */
router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, excerpt, content, category, tags, featuredImage, isPublished, publishedAt } = req.body;

    // Validation
    if (!title || !excerpt || !content || !category) {
      throw new ApiError('Title, excerpt, content, and category are required', HttpStatus.BAD_REQUEST);
    }

    // Get user from token (provided by authenticate middleware)
    const userId = req.user?.userId;
    if (!userId) {
      throw new ApiError('Authentication required', HttpStatus.UNAUTHORIZED);
    }

    // Generate slug if not provided
    const slug = generateSlug(title);

    // Check for duplicate slug
    const existingArticle = await Article.findOne({ slug });
    if (existingArticle) {
      throw new ApiError('Article with this slug already exists', HttpStatus.CONFLICT);
    }

    // Validate category exists
    const { Category } = await import('../models/Category.js');
    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) {
      throw new ApiError('Category not found', HttpStatus.BAD_REQUEST);
    }

    // Validate tags if provided
    if (tags && Array.isArray(tags) && tags.length > 0) {
      const { Tag } = await import('../models/Tag.js');
      const tagDocs = await Tag.find({ _id: { $in: tags } });
      if (tagDocs.length !== tags.length) {
        throw new ApiError('One or more tags not found', HttpStatus.BAD_REQUEST);
      }
    }

    // Determine status based on user role
    const userRole = req.user?.role;
    let articleStatus = ArticleStatus.DRAFT;
    let shouldPublish = false;

    if (isPublished === true) {
      // Only admins and editors can publish directly
      if (userRole === 'admin' || userRole === 'editor') {
        articleStatus = ArticleStatus.PUBLISHED;
        shouldPublish = true;
      } else {
        // Contributors submit for review
        articleStatus = ArticleStatus.PENDING_REVIEW;
        shouldPublish = false;
      }
    }

    // Sanitize HTML content
    const sanitizedContent = sanitizeHtml(content);
    const sanitizedExcerpt = sanitizeText(excerpt);
    const sanitizedTitle = sanitizeText(title);

    // Create article
    const article = new Article({
      title: sanitizedTitle,
      excerpt: sanitizedExcerpt,
      slug,
      content: sanitizedContent,
      category,
      tags: tags || [],
      author: userId,
      featuredImage: featuredImage || undefined,
      status: articleStatus,
      isPublished: shouldPublish,
      publishedAt: shouldPublish && publishedAt ? new Date(publishedAt) : undefined,
    });

    await article.save();

    // Populate and return
    await article.populate('category', 'name nameEn slug color');
    await article.populate('tags', 'name slug');
    await article.populate('author', 'name email');

    // Send pending review email if article was submitted for review by a contributor
    if (articleStatus === ArticleStatus.PENDING_REVIEW) {
      const authorDoc = article.author as unknown as { email: string; name: string };
      sendArticlePendingReviewEmail(authorDoc.email, authorDoc.name, article.title, article.slug).catch((error) => {
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.error('Failed to send article pending review email:', error);
        }
      });
    }

    const response: ApiResponse = {
      success: true,
      data: article.toObject(),
      message: 'Article created successfully',
    };

    res.status(HttpStatus.CREATED).json(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Handle Mongoose validation errors
    if (error instanceof Error && error.name === 'ValidationError') {
      throw new ApiError(error.message, HttpStatus.BAD_REQUEST);
    }
    // Handle duplicate key errors
    if (error instanceof Error && (error as { code?: number }).code === 11000) {
      throw new ApiError('Article with this slug already exists', HttpStatus.CONFLICT);
    }
    throw error;
  }
});

/**
 * Update article by slug
 * PUT /api/articles/:slug
 * Body: { title, excerpt, content, category, tags, featuredImage, isPublished, publishedAt }
 */
router.put('/:slug', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const { title, excerpt, content, category, tags, featuredImage, isPublished, publishedAt } = req.body;

    const article = await Article.findOne({ slug });

    if (!article) {
      throw new ApiError('Article not found', HttpStatus.NOT_FOUND);
    }

    // Check authorization (user should be author or admin)
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    if (article.author.toString() !== userId && userRole !== 'admin') {
      throw new ApiError('Not authorized to edit this article', HttpStatus.FORBIDDEN);
    }

    // Store old status for email notifications
    const oldStatus = article.status;

    // Update allowed fields
    if (title !== undefined) {
      article.title = sanitizeText(title);
      // Regenerate slug if title changed
      const newSlug = generateSlug(title);
      if (newSlug !== article.slug) {
        // Check if new slug exists
        const existingArticle = await Article.findOne({ slug: newSlug });
        if (existingArticle && existingArticle._id.toString() !== article._id.toString()) {
          throw new ApiError('Article with this slug already exists', HttpStatus.CONFLICT);
        }
        article.slug = newSlug;
      }
    }
    if (excerpt !== undefined) article.excerpt = sanitizeText(excerpt);
    if (content !== undefined) article.content = sanitizeHtml(content);
    if (category !== undefined) {
      const { Category } = await import('../models/Category.js');
      const categoryDoc = await Category.findById(category);
      if (!categoryDoc) {
        throw new ApiError('Category not found', HttpStatus.BAD_REQUEST);
      }
      article.category = category;
    }
    if (tags !== undefined) {
      if (Array.isArray(tags)) {
        const { Tag } = await import('../models/Tag.js');
        const tagDocs = await Tag.find({ _id: { $in: tags } });
        if (tagDocs.length !== tags.length) {
          throw new ApiError('One or more tags not found', HttpStatus.BAD_REQUEST);
        }
        article.tags = tags;
      }
    }
    if (featuredImage !== undefined) article.featuredImage = featuredImage;
    if (isPublished !== undefined) {
      const userRole = req.user?.role;
      
      if (isPublished) {
        // Only admins and editors can publish directly
        if (userRole === 'admin' || userRole === 'editor') {
          article.status = ArticleStatus.PUBLISHED;
          article.isPublished = true;
          if (!article.publishedAt) {
            article.publishedAt = new Date();
          }
        } else {
          // Contributors submit for review
          article.status = ArticleStatus.PENDING_REVIEW;
          article.isPublished = false;
        }
      } else {
        article.status = ArticleStatus.DRAFT;
        article.isPublished = false;
      }
    }
    
    // Allow status to be set directly (for admins/editors to approve/reject)
    if (req.body.status !== undefined) {
      const userRole = req.user?.role;
      if (userRole === 'admin' || userRole === 'editor') {
        article.status = req.body.status as ArticleStatus;
        if (req.body.status === ArticleStatus.PUBLISHED) {
          article.isPublished = true;
          if (!article.publishedAt) {
            article.publishedAt = new Date();
          }
        } else {
          article.isPublished = false;
        }
      }
    }
    if (publishedAt !== undefined) article.publishedAt = new Date(publishedAt);

    await article.save();

    // Populate and return
    await article.populate('category', 'name nameEn slug color');
    await article.populate('tags', 'name slug');
    await article.populate('author', 'name email');

    // Send emails for status changes (only for admin/editor status changes or contributor submissions)
    const authorDoc = article.author as unknown as { email: string; name: string };
    
    // If status changed from PENDING_REVIEW to PUBLISHED (approval)
    if (oldStatus === ArticleStatus.PENDING_REVIEW && article.status === ArticleStatus.PUBLISHED && (userRole === 'admin' || userRole === 'editor')) {
      sendArticleApprovalEmail(authorDoc.email, authorDoc.name, article.title, article.slug).catch((error) => {
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.error('Failed to send article approval email:', error);
        }
      });
    }
    
    // If status changed from PENDING_REVIEW to DRAFT (rejection/needs fixes)
    if (oldStatus === ArticleStatus.PENDING_REVIEW && article.status === ArticleStatus.DRAFT && (userRole === 'admin' || userRole === 'editor')) {
      // Note: reviewNotes could be added to req.body if needed in the future
      const reviewNotes = req.body.reviewNotes;
      sendArticleRejectionEmail(authorDoc.email, authorDoc.name, article.title, article.slug, reviewNotes).catch((error) => {
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.error('Failed to send article rejection email:', error);
        }
      });
    }
    
    // If contributor submits article for review (status changed to PENDING_REVIEW via isPublished)
    if (article.status === ArticleStatus.PENDING_REVIEW && oldStatus !== ArticleStatus.PENDING_REVIEW && userRole !== 'admin' && userRole !== 'editor') {
      sendArticlePendingReviewEmail(authorDoc.email, authorDoc.name, article.title, article.slug).catch((error) => {
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.error('Failed to send article pending review email:', error);
        }
      });
    }

    const response: ApiResponse = {
      success: true,
      data: article.toObject(),
      message: 'Article updated successfully',
    };

    res.json(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Handle Mongoose validation errors
    if (error instanceof Error && error.name === 'ValidationError') {
      throw new ApiError(error.message, HttpStatus.BAD_REQUEST);
    }
    throw error;
  }
});

/**
 * Delete article by slug
 * DELETE /api/articles/:slug
 */
router.delete('/:slug', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;

    const article = await Article.findOne({ slug });

    if (!article) {
      throw new ApiError('Article not found', HttpStatus.NOT_FOUND);
    }

    // Check authorization (user should be author or admin)
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    if (article.author.toString() !== userId && userRole !== 'admin') {
      throw new ApiError('Not authorized to delete this article', HttpStatus.FORBIDDEN);
    }

    await Article.deleteOne({ _id: article._id });

    res.status(HttpStatus.NO_CONTENT).send();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw error;
  }
});

/**
 * Like/Unlike an article
 * POST /api/articles/:slug/like
 */
router.post('/:slug/like', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      throw new ApiError('Authentication required', HttpStatus.UNAUTHORIZED);
    }

    const article = await Article.findOne({ slug });

    if (!article) {
      throw new ApiError('Article not found', HttpStatus.NOT_FOUND);
    }

    const likes = article.likes || [];
    const likeIndex = likes.findIndex((id) => id.toString() === userId);

    if (likeIndex === -1) {
      // Like the article
      likes.push(userId as unknown as mongoose.Types.ObjectId);
    } else {
      // Unlike the article
      likes.splice(likeIndex, 1);
    }

    article.likes = likes;
    await article.save();

    await article.populate('likes', 'name');

    const response: ApiResponse = {
      success: true,
      data: {
        liked: likeIndex === -1,
        likesCount: likes.length,
      },
      message: likeIndex === -1 ? 'Article liked' : 'Article unliked',
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
