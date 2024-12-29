// src/api/config/db.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const DATABASE_NAME = process.env.MONGODB_DATABASE || 'phoenix_automotive';

// Construct the connection string
const MONGODB_URI = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_CLUSTER}/${DATABASE_NAME}?${process.env.MONGODB_OPTIONS}`;

const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    
    // Add connection options for better reliability
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    const conn = await mongoose.connect(MONGODB_URI, options);
    console.log(`MongoDB Atlas Connected: ${conn.connection.host}`);
    console.log(`Using database: ${conn.connection.name}`);
    
    // Monitor database connection
    mongoose.connection.on('error', err => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected. Attempting to reconnect...');
      setTimeout(connectDB, 5000); // Try to reconnect after 5 seconds
    });

    return conn;
  } catch (error) {
    console.error('Error connecting to MongoDB:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    throw error;
  }
};

export default connectDB;