// src/api/config/db.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const DATABASE_NAME = process.env.MONGODB_DATABASE || 'phoenix_automotive';

// Construct the connection string
const MONGODB_URI = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_CLUSTER}/${DATABASE_NAME}?${process.env.MONGODB_OPTIONS}`;

let connection = null;

const connectDB = async () => {
  if (connection) {
    console.log('Reusing existing MongoDB connection');
    return connection;
  }

  try {
    console.log('Creating new MongoDB connection');
    connection = await mongoose.connect(MONGODB_URI, {
      // Your existing options
      maxPoolSize: 10,        // Limit maximum connections
      minPoolSize: 5,         // Maintain minimum connections
      maxIdleTimeMS: 30000    // Close idle connections after 30 seconds
    });
    return connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

export default connectDB;