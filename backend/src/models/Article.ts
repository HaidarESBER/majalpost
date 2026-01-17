import mongoose, { Schema, Document } from 'mongoose';

/**
 * Article status enum
 */
export enum ArticleStatus {
  DRAFT = 'draft',
  PENDING_REVIEW = 'pending_review',
  PUBLISHED = 'published',
}

/**
 * Article document interface
 */
export interface IArticle extends Document {
  title: string;
  excerpt: string;
  slug: string;
  content: string;
  featuredImage?: string;
  category: mongoose.Types.ObjectId;
  tags: mongoose.Types.ObjectId[];
  author: mongoose.Types.ObjectId;
  publishedAt?: Date;
  isPublished: boolean;
  status: ArticleStatus;
  views: number;
  likes: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Article schema
 */
const articleSchema = new Schema<IArticle>(
  {
    title: {
      type: String,
      required: [true, 'Article title is required'],
      trim: true,
    },
    excerpt: {
      type: String,
      required: [true, 'Article excerpt is required'],
      trim: true,
      maxlength: [500, 'Excerpt must be less than 500 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Article slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be URL-friendly (lowercase letters, numbers, hyphens only)'],
    },
    content: {
      type: String,
      required: [true, 'Article content is required'],
    },
    featuredImage: {
      type: String,
      trim: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Article category is required'],
    },
    tags: [{
      type: Schema.Types.ObjectId,
      ref: 'Tag',
    }],
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Article author is required'],
    },
    publishedAt: {
      type: Date,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: Object.values(ArticleStatus),
      default: ArticleStatus.DRAFT,
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
  },
  {
    timestamps: true,
  }
);

/**
 * Indexes for efficient querying and text search
 */
articleSchema.index({ slug: 1 });
articleSchema.index({ category: 1 });
articleSchema.index({ author: 1 });
articleSchema.index({ isPublished: 1, publishedAt: -1 });
articleSchema.index({ createdAt: -1 });

// Text search index for title, excerpt, and content
articleSchema.index(
  { title: 'text', excerpt: 'text', content: 'text' },
  {
    name: 'text_index',
    weights: {
      title: 10,
      excerpt: 5,
      content: 1,
    },
    default_language: 'none', // For Arabic support
  }
);

export const Article = mongoose.model<IArticle>('Article', articleSchema);
