// server.js
import express from 'express';
import cors from 'cors';
import router from './api/index.js';
import connectDB from './api/config/db.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables with debug info
const result = dotenv.config();
console.log('Environment Loading:', {
  currentDirectory: __dirname,
  dotenvResult: result.error ? 'Error loading .env' : '.env loaded successfully',
  error: result.error,
});

// Debug environment variables
console.log('Environment Variables Check:', {
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || 'not set',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ? 'present' : 'not set',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ? 'present' : 'not set'
});

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.raw({ type: 'image/*', limit: '10mb' }));
app.use('/api', router);

// Connect to MongoDB Atlas
connectDB()
  .then(() => console.log('Database connection established'))
  .catch(err => console.error('Error connecting to database:', err));

// Mount route handlers
app.use('/api', router);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error caught in middleware:', err);
  
  if (res.headersSent) {
    return next(err);
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.errors
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'Invalid ID format'
    });
  }

  return res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
});

// Default route
app.get('/', (req, res) => {
  res.send('Phoenix Automotive API');
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}`);
});

export default app;