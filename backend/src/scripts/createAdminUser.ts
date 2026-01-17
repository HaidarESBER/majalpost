import { connectDB, disconnectDB } from '../config/db.js';
import { User, UserRole } from '../models/User.js';

/**
 * Script to create an admin user
 * Usage: npm run create-admin
 * 
 * Creates a user with:
 * - Name: Haidar
 * - Email: haidar@majalpost.com (or specify via ADMIN_EMAIL env var)
 * - Password: admin123 (or specify via ADMIN_PASSWORD env var)
 * - Role: ADMIN
 */

async function createAdminUser(): Promise<void> {
  try {
    console.log('Connecting to database...');
    await connectDB();
    console.log('Database connected successfully');

    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    const name = process.env.ADMIN_NAME || 'Admin';

    if (!email) {
      throw new Error('ADMIN_EMAIL environment variable is required');
    }

    if (!password) {
      throw new Error('ADMIN_PASSWORD environment variable is required');
    }

    if (password.length < 8) {
      throw new Error('ADMIN_PASSWORD must be at least 8 characters long');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(`User with email ${email} already exists.`);
      console.log('User details:', {
        id: existingUser._id.toString(),
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role,
      });
      
      // Update to admin if not already
      if (existingUser.role !== UserRole.ADMIN) {
        existingUser.role = UserRole.ADMIN;
        await existingUser.save();
        console.log('User role updated to ADMIN');
      } else {
        console.log('User is already an admin.');
      }
    } else {
      // Create new admin user
      const user = new User({
        email,
        password,
        name,
        role: UserRole.ADMIN,
      });

      await user.save();
      console.log('Admin user created successfully!');
      console.log('User details:', {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      });
    }

    console.log('\n✅ Admin user setup complete!');
    console.log(`You can now login with:`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  } finally {
    await disconnectDB();
    console.log('Database connection closed');
  }
}

// Run the script
createAdminUser()
  .then(() => {
    console.log('Script finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });

