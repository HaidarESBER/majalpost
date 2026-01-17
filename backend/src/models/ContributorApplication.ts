import mongoose, { Schema, Document } from 'mongoose';

/**
 * Application status enum
 */
export enum ApplicationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

/**
 * Contributor application document interface
 */
export interface IContributorApplication extends Document {
  user: mongoose.Types.ObjectId;
  message: string;
  status: ApplicationStatus;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewNotes?: string;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Contributor application schema
 */
const contributorApplicationSchema = new Schema<IContributorApplication>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    message: {
      type: String,
      required: [true, 'Application message is required'],
      trim: true,
      maxlength: [2000, 'Message must be less than 2000 characters'],
    },
    status: {
      type: String,
      enum: Object.values(ApplicationStatus),
      default: ApplicationStatus.PENDING,
      required: true,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewNotes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Review notes must be less than 1000 characters'],
    },
    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Indexes for efficient querying
 */
contributorApplicationSchema.index({ user: 1 });
contributorApplicationSchema.index({ status: 1 });
contributorApplicationSchema.index({ createdAt: -1 });

// Prevent duplicate pending applications from the same user
contributorApplicationSchema.index({ user: 1, status: 1 }, { unique: true, partialFilterExpression: { status: ApplicationStatus.PENDING } });

export const ContributorApplication = mongoose.model<IContributorApplication>(
  'ContributorApplication',
  contributorApplicationSchema
);

