import express from 'express';
import cors from 'cors';
import router from './api/index.js';
import connectDB from './api/config/db.js';
import { cookieParser } from './api/middleware/cookies.js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import compression from 'compression';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

// Trust proxy (important for production behind load balancers)
app.set('trust proxy', 1);

// CORS Configuration - Simplified and eBay-friendly
const corsOptions = {
  origin: function (origin, callback) {
    // Allow eBay and your own domains
    const allowedOrigins = [
      'https://developer.ebay.com',
      'https://api.ebay.com',
      'https://phxautogroup.com',
      'https://www.phxautogroup.com',
      process.env.FRONTEND_URL,
    ].filter(Boolean);
    
    // Allow no origin (for server-to-server requests like eBay's)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Be permissive for eBay compliance
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'Accept', 
    'Origin', 
    'Cache-Control'
  ],
  maxAge: 86400 // 24 hours
};

// Apply middleware in correct order
app.use(compression());
app.use(cors(corsOptions));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} | ${req.method} ${req.url}`);
  next();
});

// Body parsing middleware
app.use(express.json({
  limit: '10mb',
  verify: (req, res, buf) => {
    // Store raw body for webhook signature verification if needed
    req.rawBody = buf;
  }
}));

app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser);

// Health check routes
app.get('/healthz', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    ebayConfig: {
      hasToken: !!process.env.EBAY_VERIFICATION_TOKEN,
      endpointUrl: process.env.EBAY_ENDPOINT_URL
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    ebayConfig: {
      hasToken: !!process.env.EBAY_VERIFICATION_TOKEN,
      endpointUrl: process.env.EBAY_ENDPOINT_URL
    }
  });
});

// API routes (must come before static file serving)
app.use('/api', router);

// Static file serving for production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../dist');
  
  console.log('Production mode: serving static files from:', distPath);
  
  // Check if dist directory exists
  if (!fs.existsSync(distPath)) {
    console.error('ERROR: dist directory not found at:', distPath);
    console.log('Available directories:', fs.readdirSync(__dirname));
  }
  
  // Serve static files with proper caching
  app.use(express.static(distPath, {
    maxAge: process.env.NODE_ENV === 'production' ? '1y' : '0',
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
      // Set correct MIME types
      const ext = path.extname(filePath).toLowerCase();
      
      switch (ext) {
        case '.js':
          res.set('Content-Type', 'application/javascript; charset=UTF-8');
          break;
        case '.css':
          res.set('Content-Type', 'text/css; charset=UTF-8');
          break;
        case '.json':
          res.set('Content-Type', 'application/json; charset=UTF-8');
          break;
        case '.svg':
          res.set('Content-Type', 'image/svg+xml');
          break;
        case '.png':
          res.set('Content-Type', 'image/png');
          break;
        case '.jpg':
        case '.jpeg':
          res.set('Content-Type', 'image/jpeg');
          break;
        case '.woff':
          res.set('Content-Type', 'font/woff');
          break;
        case '.woff2':
          res.set('Content-Type', 'font/woff2');
          break;
      }
      
      // Set caching headers
      if (filePath.includes('/assets/') || ext === '.js' || ext === '.css') {
        res.set('Cache-Control', 'public, max-age=31536000, immutable');
      } else {
        res.set('Cache-Control', 'public, max-age=86400');
      }
    }
  }));

  // Handle client-side routing - serve index.html for non-API routes
  app.get('*', (req, res) => {
    // Skip API routes (should already be handled above)
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }

    // Skip if file extension suggests it's a static asset
    if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|json|map|txt|xml|pdf|woff|woff2|ttf|eot)$/)) {
      return res.status(404).send('File not found');
    }

    // Serve index.html for client-side routes
    const indexPath = path.join(distPath, 'index.html');
    
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath, (err) => {
        if (err) {
          console.error('Error serving index.html:', err);
          res.status(500).send('Error loading application');
        }
      });
    } else {
      console.error('index.html not found at:', indexPath);
      res.status(500).send('Application not found');
    }
  });
  
} else {
  // Development mode
  app.get('/', (req, res) => {
    res.json({
      message: 'Phoenix Automotive API - Development Mode',
      timestamp: new Date().toISOString(),
      endpoints: {
        health: '/api/health',
        ebayCompliance: '/api/partsmatrix'
      }
    });
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  if (res.headersSent) {
    return next(err);
  }

  const errorResponse = {
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  };

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({ ...errorResponse, details: err.errors });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({ ...errorResponse, error: 'Invalid ID format' });
  }
  
  if (err.code === 11000) {
    return res.status(409).json({ ...errorResponse, error: 'Duplicate key error' });
  }

  res.status(err.status || 500).json(errorResponse);
});

// 404 handler for unmatched routes
app.use('*', (req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    error: 'Not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// Graceful error handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
  process.exit(1);
});

// Connect to MongoDB
connectDB()
  .then(() => {
    console.log('✅ Database connection established');
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
  });

// Start server
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 eBay endpoint: ${process.env.EBAY_ENDPOINT_URL || 'Not configured'}`);
  
  if (process.env.NODE_ENV !== 'production') {
    console.log(`🌐 API available at http://localhost:${PORT}`);
    console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
  }
}).on('error', (error) => {
  console.error('❌ Server failed to start:', error);
  
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
  }
  
  process.exit(1);
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
  
  // Force close after 10 seconds
  setTimeout(() => {
    console.log('❌ Force closing server');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default app;