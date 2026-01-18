/**
 * Script to set a user as admin by email
 * Usage: npm run set-admin <email>
 * Example: npm run set-admin haidaresber01@gmail.com
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Import User model
const { User, UserRole } = await import('../models/User.js');

async function setAdmin(email: string): Promise<void> {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('Error: MONGODB_URI environment variable is not set');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      console.error(`Error: User with email "${email}" not found`);
      await mongoose.disconnect();
      process.exit(1);
    }

    // Check if already admin
    if (user.role === UserRole.ADMIN) {
      console.log(`User "${email}" is already an admin`);
      await mongoose.disconnect();
      process.exit(0);
    }

    // Update to admin
    user.role = UserRole.ADMIN;
    await user.save();

    console.log(`✓ Successfully set user "${email}" as admin`);
    console.log(`  User ID: ${user._id}`);
    console.log(`  Name: ${user.name}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Role: ${user.role}`);

    await mongoose.disconnect();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error setting admin:', error);
    await mongoose.disconnect();
    throw error;
  }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.error('Error: Email is required');
  console.log('Usage: npm run set-admin <email>');
  console.log('Example: npm run set-admin haidaresber01@gmail.com');
  process.exit(1);
}

// Run the script
setAdmin(email)
  .then(() => {
    console.log('\n✅ Script finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

