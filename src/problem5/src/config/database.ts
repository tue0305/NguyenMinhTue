import mongoose from 'mongoose';

// Database connection URL (default to local MongoDB instance)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/product-api';

// Connect to MongoDB
export const dbConnect = async (): Promise<typeof mongoose> => {
  try {
    const connection = await mongoose.connect(MONGODB_URI);
    console.log(`MongoDB connected: ${connection.connection.host}`);
    return connection;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error}`);
    throw error;
  }
};