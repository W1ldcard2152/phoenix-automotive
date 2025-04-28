import express from 'express';
import cors from 'cors';
import router from './api/index.js';
import connectDB from './api/config/db.js';
import { securityHeaders, rateLimit } from './api/middleware/security.js';
import { secureCookies, cookieParser } from './api/middleware/cookies.js';
import { csrfProtection, setCsrfToken } from './api/middleware/csrf.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

// CORS Configuration with enhanced error handling
const corsOptions = {
  origin: function (origin, callback) {
    try {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      const allowedOrigins = process.env.NODE_ENV === 'production'
        ? [process.env.CLIENT_URL || 'https://phoenix-automotive.onrender.com']
        : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'];

      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true);
      } else {
        console.warn('CORS blocked request from:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    } catch (error) {
      console.error('CORS error:', error);
      callback(error);
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'Accept', 
    'Origin', 
    'Cache-Control', 
    'Pragma',
    'X-CSRF-Token'
  ],
  maxAge: 86400 // CORS preflight cache for 24 hours
};

app.use(cors(corsOptions));

// Apply security middleware
app.use(securityHeaders);
app.use(cookieParser);
app.use(secureCookies);
app.use(setCsrfToken);
app.use(rateLimit);

// CORS related headers
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-CSRF-Token');
  
  // Handle OPTIONS requests explicitly
  if (req.method === 'OPTIONS') {
    // Explicitly set the allowed headers for OPTIONS requests
    res.header('Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-CSRF-Token');
    return res.status(200).end(); // Changed from 204 to 200 to fix some browsers' behavior
  }
  
  next();
});

// Body parsing middleware with enhanced error handling
app.use(express.json({
  limit: '10mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      console.error('Invalid JSON:', e);
      res.status(400).json({ error: 'Invalid JSON payload' });
      throw new Error('Invalid JSON');
    }
  }
}));

app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.raw({ type: 'image/*', limit: '10mb' }));

// Health check route with basic system info
app.get('/healthz', (req, res) => {
  const health = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    status: 'OK'
  };
  res.status(200).json(health);
});

// Enhanced request logging for all environments
app.use((req, res, next) => {
  const start = Date.now();
  
  // Log request
  console.log({
    timestamp: new Date().toISOString(),
    type: 'request',
    method: req.method,
    path: req.path,
    userAgent: req.get('user-agent'),
    ip: req.ip
  });

  // Log response
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (res.statusCode >= 400) {
      console.error({
        timestamp: new Date().toISOString(),
        type: 'response',
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        userAgent: req.get('user-agent'),
        ip: req.ip
      });
    }
  });

  next();
});

// API routes
app.use('/api', router);

// Static file serving with enhanced caching
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist'), {
    maxAge: '1y',
    etag: true,
    lastModified: true
  }));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'), {
      maxAge: '1d',
      headers: {
        'Cache-Control': 'public, max-age=86400'
      }
    });
  });
} else {
  app.get('/', (req, res) => {
    res.send('Phoenix Automotive API');
  });
}

// Comprehensive error handling middleware
app.use((err, req, res, next) => {
  const errorResponse = {
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
    error: err.name || 'Error',
    message: err.message || 'An unexpected error occurred',
    details: null,
    requestId: req.id,
    userAgent: req.get('user-agent'),
    browser: req.get('sec-ch-ua')
  };

  // Log all errors in any environment if they're 500s
  if (err.status === 500 || !err.status) {
    console.error('Server Error:', {
      ...errorResponse,
      stack: err.stack,
      headers: req.headers,
      query: req.query,
      params: req.params
    });
  }

  if (res.headersSent) {
    return next(err);
  }

  // Handle specific error types
  switch (err.name) {
    case 'ValidationError':
      errorResponse.details = err.errors;
      return res.status(400).json(errorResponse);
    
    case 'CastError':
      errorResponse.message = 'Invalid ID format';
      return res.status(400).json(errorResponse);
    
    case 'MongoError':
      if (err.code === 11000) {
        errorResponse.message = 'Duplicate key error';
        return res.status(409).json(errorResponse);
      }
      break;
    
    case 'SyntaxError':
      if (err.status === 400) {
        errorResponse.message = 'Invalid request syntax';
        return res.status(400).json(errorResponse);
      }
      break;
  }

  return res.status(err.status || 500).json(errorResponse);
});

// Fallback error handler for uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
});

// Connect to MongoDB with enhanced error handling
connectDB()
  .then(() => {
    console.log('Database connection established');
  })
  .catch(err => {
    console.error('Fatal: Database connection failed:', err);
    process.exit(1);
  });

// Start server with enhanced error handling
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`API available at http://localhost:${PORT}`);
  }
}).on('error', (error) => {
  console.error('Server failed to start:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;