import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      const errorMessage = 'Missing MONGODB_URI environment variable';
      console.error(`MongoDB Connection Error: ${errorMessage}`);
      console.warn('Continuing with database disabled; dependent features may fail.');
      return null;
    }

    mongoose.set('bufferCommands', false);

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`MongoDB Connection Warning: ${error.message}`);
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }

    console.warn('Continuing in development mode with database warnings...');
    return null;
  }
};

export default connectDB;
