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
    
    // Updated options without deprecated flags
    const options = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 5,
      maxIdleTimeMS: 30000,
      authSource: 'admin',
      retryWrites: true,
      w: 'majority'
    };

    const conn = await mongoose.connect(MONGODB_URI, options);
    
    // Enhanced connection logging
    console.log(`MongoDB Atlas Connected: ${conn.connection.host}`);
    console.log(`Using database: ${conn.connection.name}`);
    console.log('Connection state:', conn.connection.readyState);
    
    // Enhanced connection monitoring
    mongoose.connection.on('error', err => {
      console.error('MongoDB connection error:', {
        message: err.message,
        code: err.code,
        name: err.name,
        timestamp: new Date().toISOString()
      });
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...', {
        timestamp: new Date().toISOString()
      });
      // Attempt reconnection with exponential backoff
      setTimeout(connectDB, 5000);
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected successfully', {
        timestamp: new Date().toISOString()
      });
    });

    return conn;
  } catch (error) {
    // Enhanced error logging
    console.error('Error connecting to MongoDB:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      name: error.name,
      timestamp: new Date().toISOString()
    });
    
    // Specific error handling for common connection issues
    if (error.name === 'MongoServerSelectionError') {
      console.error('MongoDB Server Selection Error. Please check:', {
        timestamp: new Date().toISOString(),
        details: [
          'Network connectivity',
          'MongoDB Atlas whitelist settings',
          'Database user credentials',
          'VPC/Firewall settings'
        ]
      });
    }

    if (error.name === 'MongoNetworkError') {
      console.error('MongoDB Network Error. Please check:', {
        timestamp: new Date().toISOString(),
        details: [
          'Internet connectivity',
          'MongoDB Atlas status',
          'DNS resolution',
          'Proxy settings'
        ]
      });
    }

    throw error;
  }
};

export default connectDB;