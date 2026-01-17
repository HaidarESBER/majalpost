import mongoose, { Schema, Document } from 'mongoose';

/**
 * Tag document interface
 */
export interface ITag extends Document {
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Tag schema
 */
const tagSchema = new Schema<ITag>(
  {
    name: {
      type: String,
      required: [true, 'Tag name is required'],
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      required: [true, 'Tag slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be URL-friendly (lowercase letters, numbers, hyphens only)'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Index for efficient queries
 */
tagSchema.index({ slug: 1 });
tagSchema.index({ name: 1 });

export const Tag = mongoose.model<ITag>('Tag', tagSchema);

