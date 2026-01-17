import mongoose, { Schema, Document } from 'mongoose';

/**
 * Comment document interface
 */
export interface IComment extends Document {
  content: string;
  article: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Comment schema
 */
const commentSchema = new Schema<IComment>(
  {
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true,
      maxlength: [2000, 'Comment must be less than 2000 characters'],
    },
    article: {
      type: Schema.Types.ObjectId,
      ref: 'Article',
      required: [true, 'Article reference is required'],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Comment author is required'],
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Indexes for efficient querying
 */
commentSchema.index({ article: 1, createdAt: -1 });
commentSchema.index({ author: 1 });

export const Comment = mongoose.model<IComment>('Comment', commentSchema);

