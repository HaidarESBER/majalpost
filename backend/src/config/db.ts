import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDB(): Promise<void> {
  try {
    // Set up connection event listeners
    mongoose.connection.on('connected', () => {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log('MongoDB connected successfully');
      }
    });

    mongoose.connection.on('error', (err) => {
      // Always log errors
      // eslint-disable-next-line no-console
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log('MongoDB disconnected');
      }
    });

    // Connect to MongoDB
    await mongoose.connect(env.MONGODB_URI);
  } catch (error) {
    // Always log connection failures
    // eslint-disable-next-line no-console
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

export async function disconnectDB(): Promise<void> {
  try {
    await mongoose.disconnect();
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log('MongoDB connection closed');
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error disconnecting from MongoDB:', error);
    throw error;
  }
}

export default { connectDB, disconnectDB };
