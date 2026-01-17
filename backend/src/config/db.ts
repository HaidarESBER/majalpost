import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDB(): Promise<void> {
  try {
    // Set up connection event listeners
    mongoose.connection.on('connected', () => {
      console.log('MongoDB connected successfully');
    });

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    // Connect to MongoDB
    await mongoose.connect(env.MONGODB_URI);
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

export async function disconnectDB(): Promise<void> {
  try {
    await mongoose.disconnect();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error);
    throw error;
  }
}

export default { connectDB, disconnectDB };
