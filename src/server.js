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

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.raw({ type: 'image/*', limit: '10mb' }));

// Health check route
app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

// Request logging middleware
if (process.env.NODE_ENV !== 'production') {
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
}

// API routes

app.get('/api/health', async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    res.json({
      status: 'ok',
      environment: process.env.NODE_ENV,
      database: dbStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.use('/api', router);

// Serve static files from the React build directory in production
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the dist directory
  app.use(express.static(path.join(__dirname, '../dist')));

  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
} else {
  // Default route for development
  app.get('/', (req, res) => {
    res.send('Phoenix Automotive API');
  });
}

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

  // Only log detailed errors in non-production environments
  if (process.env.NODE_ENV !== 'production') {
    console.error('Error caught in middleware:', {
      ...errorResponse,
      stack: err.stack
    });
  }

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

  return res.status(500).json(errorResponse);
});

// Connect to MongoDB Atlas
connectDB()
  .then(() => console.log('Database connection established'))
  .catch(err => console.error('Error connecting to database:', err));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`API available at http://localhost:${PORT}`);
  }
});

export default app;