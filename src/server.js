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

// Request logging middleware
app.use((req, res, next) => {
  console.log('Incoming request:', {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    contentType: req.headers['content-type'],
    body: req.path.includes('part-requests') ? req.body : '[body omitted]'
  });
  next();
});

// Mount route handlers - only once
app.use('/api', router);

// Connect to MongoDB Atlas
connectDB()
  .then(() => console.log('Database connection established'))
  .catch(err => console.error('Error connecting to database:', err));

// Enhanced error handling middleware
app.use((err, req, res, next) => {
  const errorResponse = {
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
    error: err.name || 'Error',
    message: err.message || 'An unexpected error occurred',
    details: null
  };

  console.error('Error caught in middleware:', {
    ...errorResponse,
    stack: err.stack
  });

  if (res.headersSent) {
    return next(err);
  }

  if (err.name === 'ValidationError') {
    errorResponse.details = err.errors;
    return res.status(400).json(errorResponse);
  }

  if (err.name === 'CastError') {
    errorResponse.message = 'Invalid ID format';
    return res.status(400).json(errorResponse);
  }

  // Part request specific error handling
  if (req.path.includes('part-requests')) {
    console.error('Parts request error:', {
      body: req.body,
      error: err
    });
  }

  return res.status(500).json(errorResponse);
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