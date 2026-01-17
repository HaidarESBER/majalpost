import mongoose, { Schema, Document } from 'mongoose';

/**
 * Media document interface
 */
export interface IMedia extends Document {
  filename: string;
  originalPath: string;
  thumbnailPath?: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  uploadedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Media schema
 */
const mediaSchema = new Schema<IMedia>(
  {
    filename: {
      type: String,
      required: [true, 'Filename is required'],
      trim: true,
    },
    originalPath: {
      type: String,
      required: [true, 'Original path is required'],
    },
    thumbnailPath: {
      type: String,
      default: undefined,
    },
    mimeType: {
      type: String,
      required: [true, 'MIME type is required'],
    },
    size: {
      type: Number,
      required: [true, 'File size is required'],
      min: 0,
    },
    width: {
      type: Number,
      default: undefined,
    },
    height: {
      type: Number,
      default: undefined,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: undefined,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
mediaSchema.index({ createdAt: -1 }); // Sort by upload date (newest first)
mediaSchema.index({ mimeType: 1 }); // Filter by type

export const Media = mongoose.model<IMedia>('Media', mediaSchema);

