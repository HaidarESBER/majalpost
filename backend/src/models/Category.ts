import mongoose, { Schema, Document } from 'mongoose';

/**
 * Category document interface
 */
export interface ICategory extends Document {
  name: string;
  nameEn: string;
  slug: string;
  description?: string;
  color: string;
  subCategories?: string[];
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Category schema
 */
const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, 'Category name (Arabic) is required'],
      trim: true,
    },
    nameEn: {
      type: String,
      required: [true, 'Category name (English) is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Category slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be URL-friendly (lowercase letters, numbers, hyphens only)'],
    },
    description: {
      type: String,
      trim: true,
    },
    color: {
      type: String,
      required: [true, 'Category color is required'],
      match: [/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color code (e.g., #10b981)'],
    },
    subCategories: [{
      type: String,
      trim: true,
    }],
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Index for efficient queries
 */
categorySchema.index({ slug: 1 });
categorySchema.index({ order: 1, name: 1 });

export const Category = mongoose.model<ICategory>('Category', categorySchema);

