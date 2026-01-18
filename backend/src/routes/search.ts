import { Router, Request, Response } from 'express';
import { ApiResponse } from '../types/index.js';
import { ApiError, HttpStatus } from '../types/index.js';
import { generalLimiter } from '../middleware/rateLimit.js';

const router = Router();

/**
 * Search articles endpoint
 * GET /api/search
 * Query params: q (required), limit (default: 20), offset (default: 0), category (optional)
 */
router.get('/', generalLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const { q, limit: limitParam, offset: offsetParam, category } = req.query;

    // Validate query parameter
    if (!q || typeof q !== 'string' || q.trim().length === 0) {
      throw new ApiError('Search query (q) is required', HttpStatus.BAD_REQUEST);
    }

    // Parse pagination parameters
    const limit = limitParam ? parseInt(limitParam as string, 10) : 20;
    const offset = offsetParam ? parseInt(offsetParam as string, 10) : 0;

    // Validate pagination
    if (isNaN(limit) || limit < 1 || limit > 100) {
      throw new ApiError('Limit must be between 1 and 100', HttpStatus.BAD_REQUEST);
    }
    if (isNaN(offset) || offset < 0) {
      throw new ApiError('Offset must be a non-negative number', HttpStatus.BAD_REQUEST);
    }

    // Import Article model dynamically (will fail gracefully if not exists)
    // Note: Article model should exist from Phase 3 (03-02)
    let Article: any;
    try {
      Article = (await import('../models/Article.js')).Article;
    } catch (error) {
      throw new ApiError('Article model not found. Please ensure Article model exists from Phase 3.', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // Build search query
    const searchQuery: Record<string, unknown> = {
      $text: { $search: q.trim() },
      isPublished: true, // Only show published articles
    };

    // Add category filter if provided - convert slug to ObjectId
    if (category && typeof category === 'string') {
      const { Category } = await import('../models/Category.js');
      const categoryDoc = await Category.findOne({ slug: category });
      if (categoryDoc) {
        searchQuery.category = categoryDoc._id;
      }
      // If category not found, skip category filter (search all categories)
    }

    // Execute search with text score
    const articles = await Article.find(searchQuery)
      .select('_id title excerpt slug featuredImage category tags author publishedAt createdAt')
      .populate('category', 'name slug color')
      .populate('tags', 'name slug')
      .populate('author', 'name')
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit)
      .skip(offset)
      .lean();

    // Get total count for pagination
    const total = await Article.countDocuments(searchQuery);

    // Import Media model to resolve filenames
    const { Media } = await import('../models/Media.js');
    const resolveFeaturedImageUrl = async (featuredImage: string | undefined | null): Promise<string | undefined> => {
      if (!featuredImage) {
        return undefined;
      }
      if (featuredImage.startsWith('http://') || featuredImage.startsWith('https://')) {
        return featuredImage;
      }
      const filenamePattern = /^[^/\\]+\.(png|jpg|jpeg|gif|webp)$/i;
      if (filenamePattern.test(featuredImage)) {
        // Extract filename without extension to match Cloudinary public_id
        const filenameWithoutExt = featuredImage.replace(/\.(png|jpg|jpeg|gif|webp)$/i, '');
        
        // Try to find by cloudinaryPublicId pattern first (more reliable)
        const mediaByPublicId = await Media.findOne({
          cloudinaryPublicId: new RegExp(`${filenameWithoutExt}$`),
        }).lean();
        if (mediaByPublicId && (mediaByPublicId as any).url) {
          return (mediaByPublicId as any).url;
        }
        
        // Fallback: Try to find media by filename
        const media = await Media.findOne({ filename: featuredImage }).lean();
        if (media && (media as any).url) {
          return (media as any).url;
        }
      }
      return featuredImage;
    };

    // Transform results to match SearchResult interface
    const results = await Promise.all(articles.map(async (article: any) => ({
      _id: article._id.toString(),
      title: article.title,
      excerpt: article.excerpt,
      slug: article.slug,
      featuredImage: await resolveFeaturedImageUrl(article.featuredImage),
      category: {
        _id: article.category?._id?.toString() || '',
        name: article.category?.name || '',
        slug: article.category?.slug || '',
        color: article.category?.color,
      },
      tags: (article.tags || []).map((tag: any) => ({
        _id: tag._id?.toString() || '',
        name: tag.name || '',
        slug: tag.slug || '',
      })),
      author: {
        _id: article.author?._id?.toString() || '',
        name: article.author?.name || '',
      },
      publishedAt: article.publishedAt,
      createdAt: article.createdAt,
      score: article.score,
    })));

    const response: ApiResponse<{
      results: typeof results;
      pagination: {
        total: number;
        limit: number;
        offset: number;
        hasMore: boolean;
      };
    }> = {
      success: true,
      data: {
        results,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      },
    };

    res.json(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Handle MongoDB errors
    if (error instanceof Error) {
      throw new ApiError(`Search error: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    throw error;
  }
});

export default router;

