/**
 * Base entity type for all MongoDB documents
 */
export interface BaseEntity {
  _id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * User roles for role-based access control
 */
export enum UserRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
  CONTRIBUTOR = 'contributor',
}

/**
 * User model type (for API responses)
 */
export interface User extends BaseEntity {
  email: string;
  name: string;
  role: UserRole;
}

/**
 * Category model type (for API responses)
 * Represents main navigation categories like البيئة والمناخ, شؤون الناس, etc.
 */
export interface Category extends BaseEntity {
  name: string; // Arabic name, e.g., "البيئة والمناخ"
  nameEn: string; // English name for admin/internal use, e.g., "Environment & Climate"
  slug: string; // URL-friendly identifier, e.g., "environment-climate"
  description?: string; // Optional Arabic description
  color: string; // Hex color code for theming, e.g., "#10b981" for emerald
  subCategories?: string[]; // Array of sub-category slugs
  isActive: boolean; // Soft enable/disable (default: true)
  order: number; // Display order in navigation (default: 0)
}

/**
 * Tag model type (for API responses)
 * Represents content tags like #بيروت, #استدامة, etc.
 */
export interface Tag extends BaseEntity {
  name: string; // Arabic tag name, e.g., "#بيروت" or "استدامة"
  slug: string; // URL-friendly identifier, e.g., "beirut" or "sustainability"
  isActive: boolean; // Soft enable/disable (default: true)
}

// Model types will be added in later phases
// - Article
// - Media
// - ContactSubmission
