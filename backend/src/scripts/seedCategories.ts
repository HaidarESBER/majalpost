import { connectDB, disconnectDB } from '../config/db.js';
import { Category } from '../models/Category.js';

/**
 * Seed script to create all categories for Majal Post
 * Based on the project requirements in desc.md
 */

const categories = [
  {
    name: 'البيئة والمناخ',
    nameEn: 'Environment & Climate',
    slug: 'environment', // Matches frontend Header.tsx
    description: 'قضايا البيئة والمناخ والاستدامة في لبنان',
    color: '#10b981', // Emerald Green
    subCategories: ['ثروة طبيعية', 'زراعة وأرض', 'طاقة واستدامة'],
    isActive: true,
    order: 1,
  },
  {
    name: 'شؤون الناس',
    nameEn: 'Society',
    slug: 'society',
    description: 'قضايا المجتمع اليومية والتحديات الاجتماعية',
    color: '#8b5cf6', // Violet
    subCategories: [],
    isActive: true,
    order: 2,
  },
  {
    name: 'اقتصاد ومعيشة',
    nameEn: 'Economy',
    slug: 'economy',
    description: 'التحديات الاقتصادية والمالية والحياة اليومية',
    color: '#1e40af', // Navy Blue
    subCategories: [],
    isActive: true,
    order: 3,
  },
  {
    name: 'تربية وتعليم',
    nameEn: 'Education',
    slug: 'education',
    description: 'أخبار التربية والتعليم والتطوير التربوي',
    color: '#0ea5e9', // Sky Blue
    subCategories: [],
    isActive: true,
    order: 4,
  },
  {
    name: 'تكنولوجيا وابتكار',
    nameEn: 'Technology & Innovation',
    slug: 'tech', // Matches frontend Header.tsx
    description: 'التحول الرقمي والابتكارات الحديثة',
    color: '#14b8a6', // Teal
    subCategories: [],
    isActive: true,
    order: 5,
  },
  {
    name: 'صحة وحياة',
    nameEn: 'Health & Wellness',
    slug: 'health',
    description: 'الصحة والرفاهية ونمط الحياة الصحي',
    color: '#f87171', // Coral/Soft Red
    subCategories: [],
    isActive: true,
    order: 6,
  },
];

// Old slugs that need to be removed (if they exist)
const oldSlugsToRemove = ['environment-climate', 'technology'];

async function seedCategories(): Promise<void> {
  try {
    console.log('Connecting to database...');
    await connectDB();

    console.log('Starting category seeding...');

    // Remove old categories with incorrect slugs
    for (const oldSlug of oldSlugsToRemove) {
      const oldCategory = await Category.findOne({ slug: oldSlug });
      if (oldCategory) {
        await Category.deleteOne({ slug: oldSlug });
        console.log(`✓ Removed old category with slug: ${oldSlug}`);
      }
    }

    // Create or update categories
    for (const categoryData of categories) {
      const existingCategory = await Category.findOne({ slug: categoryData.slug });

      if (existingCategory) {
        // Update existing category (except slug which is immutable)
        existingCategory.name = categoryData.name;
        existingCategory.nameEn = categoryData.nameEn;
        existingCategory.description = categoryData.description;
        existingCategory.color = categoryData.color;
        existingCategory.subCategories = categoryData.subCategories;
        existingCategory.isActive = categoryData.isActive;
        existingCategory.order = categoryData.order;
        await existingCategory.save();
        console.log(`✓ Updated category: ${categoryData.name} (${categoryData.nameEn})`);
      } else {
        const category = new Category(categoryData);
        await category.save();
        console.log(`✓ Created category: ${categoryData.name} (${categoryData.nameEn})`);
      }
    }

    console.log('\n✅ Category seeding completed successfully!');
    console.log(`Total categories: ${categories.length}`);
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    throw error;
  } finally {
    await disconnectDB();
    console.log('Database connection closed');
  }
}

// Run the seed script
seedCategories()
  .then(() => {
    console.log('Seed script finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seed script failed:', error);
    process.exit(1);
  });

