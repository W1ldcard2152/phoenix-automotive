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
    const conn = await mongoose.connect(MONGODB_URI);
    console.log(`MongoDB Atlas Connected: ${conn.connection.host}`);
    console.log(`Using database: ${conn.connection.name}`);
    
    mongoose.connection.on('error', err => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    throw error;
  }
};

export default connectDB;