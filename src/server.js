import express from 'express';
import cors from 'cors';
import router from './api/index.js';
import connectDB from './api/config/db.js';
import { securityHeaders, rateLimit } from './api/middleware/security.js';
import { secureCookies, cookieParser } from './api/middleware/cookies.js';
import { csrfProtection, setCsrfToken } from './api/middleware/csrf.js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

// Enhanced CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow all origins for asset files
    callback(null, true);
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
  exposedHeaders: ['Content-Length', 'Content-Type', 'X-Powered-By'],
  maxAge: 86400 // CORS preflight cache for 24 hours
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Enable pre-flight requests for all routes
app.options('*', cors(corsOptions));

// Simplified middleware chain
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} | ${req.method} ${req.url}`);
  next();
});

// Apply only the essential middleware
app.use(cookieParser);

// CORS related headers
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle OPTIONS requests explicitly
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Body parsing middleware
app.use(express.json({
  limit: '10mb'
}));

app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check route
app.get('/healthz', (req, res) => {
  const health = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    status: 'OK'
  };
  res.status(200).json(health);
});

// API routes
app.use('/api', router);

// Log the environment
console.log('Current NODE_ENV:', process.env.NODE_ENV);

// Static file serving with enhanced caching and mime types
if (process.env.NODE_ENV === 'production') {
  // Log the static file path
  console.log('Serving static files from:', path.join(__dirname, '../dist'));
  
  // Add proper MIME type handling for JavaScript and CSS files
  app.use(express.static(path.join(__dirname, '../dist'), {
    maxAge: '1y',
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
      // Set correct Content-Type header for different file types
      if (filePath.endsWith('.js')) {
        res.set('Content-Type', 'application/javascript; charset=UTF-8');
      } else if (filePath.endsWith('.css')) {
        res.set('Content-Type', 'text/css; charset=UTF-8');
      } else if (filePath.endsWith('.json')) {
        res.set('Content-Type', 'application/json; charset=UTF-8');
      } else if (filePath.endsWith('.svg')) {
        res.set('Content-Type', 'image/svg+xml');
      } else if (filePath.endsWith('.png')) {
        res.set('Content-Type', 'image/png');
      } else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
        res.set('Content-Type', 'image/jpeg');
      }
      
      // Set caching headers
      if (filePath.includes('/assets/')) {
        res.set('Cache-Control', 'public, max-age=31536000, immutable');
      } else {
        res.set('Cache-Control', 'public, max-age=86400');
      }
    }
  }));

  // Handle direct requests to asset files with proper MIME types
  app.get('/assets/*', (req, res, next) => {
    // Try to send the file from the dist directory
    const filePath = path.join(__dirname, '../dist', req.path);
    console.log('Looking for asset file at:', filePath);
    
    // Check if file exists
    try {
      if (fs.existsSync(filePath)) {
        // Determine content type based on file extension
        const ext = path.extname(filePath).toLowerCase();
        let contentType = 'application/octet-stream';
        
        switch (ext) {
          case '.js':
            contentType = 'application/javascript; charset=UTF-8';
            break;
          case '.css':
            contentType = 'text/css; charset=UTF-8';
            break;
          case '.json':
            contentType = 'application/json; charset=UTF-8';
            break;
          case '.png':
            contentType = 'image/png';
            break;
          case '.jpg':
          case '.jpeg':
            contentType = 'image/jpeg';
            break;
          case '.svg':
            contentType = 'image/svg+xml';
            break;
          case '.woff':
            contentType = 'font/woff';
            break;
          case '.woff2':
            contentType = 'font/woff2';
            break;
          case '.ttf':
            contentType = 'font/ttf';
            break;
          case '.eot':
            contentType = 'application/vnd.ms-fontobject';
            break;
        }
        
        res.set('Content-Type', contentType);
        return res.sendFile(filePath, {
          maxAge: '1y',
          headers: {
            'Cache-Control': 'public, max-age=31536000, immutable'
          }
        });
      }
    } catch (err) {
      console.error('Error checking for asset file:', err);
    }
    
    // If we get here, the file wasn't found or had an error
    next();
  });

  // Additional middleware for ensuring MIME types are set correctly
  app.use((req, res, next) => {
    // Make sure appropriate content types are set for all asset files
    if (req.path.includes('/assets/')) {
      const ext = path.extname(req.path).toLowerCase();
      if (ext === '.js') {
        res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
      } else if (ext === '.css') {
        res.setHeader('Content-Type', 'text/css; charset=UTF-8');
      } else if (ext === '.map') {
        res.setHeader('Content-Type', 'application/json; charset=UTF-8');
      }
    }
    next();
  });

  // Handle specific CSS and JS files that are causing issues
  app.get('*/index.*.js', (req, res) => {
    const jsPath = path.join(__dirname, '../dist', req.path);
    if (fs.existsSync(jsPath)) {
      res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
      res.sendFile(jsPath);
    } else {
      res.status(404).send('File not found');
    }
  });

  app.get('*/index.*.css', (req, res) => {
    const cssPath = path.join(__dirname, '../dist', req.path);
    if (fs.existsSync(cssPath)) {
      res.setHeader('Content-Type', 'text/css; charset=UTF-8');
      res.sendFile(cssPath);
    } else {
      res.status(404).send('File not found');
    }
  });

  // Handle all client-side routes - serve index.html
  // This is CRITICAL for React Router to work correctly
  app.get('*', (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api')) {
      return next();
    }

    // Skip asset files
    if (req.path.startsWith('/assets')) {
      return next();
    }

    // Skip static asset files
    if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|json|map|txt|xml|pdf|woff|woff2|ttf|eot)$/)) {
      return next();
    }

    // For all other routes, serve index.html
    console.log('Serving index.html for path:', req.path);
    
    const indexPath = path.join(__dirname, '../dist/index.html');
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error('Error serving index.html:', err);
        res.status(500).send('Error loading application');
      }
    });
  });
  
  // Fallback handler to ensure all routes return index.html
  app.use((req, res, next) => {
    // If we've reached this point, and it's not an API or asset request
    if (!res.headersSent && !req.path.startsWith('/api') && !req.path.startsWith('/assets')) {
      console.log('Fallback handler serving index.html for:', req.path);
      const indexPath = path.join(__dirname, '../dist/index.html');
      res.sendFile(indexPath, {
        maxAge: '1d',
        headers: {
          'Cache-Control': 'public, max-age=86400'
        }
      }, (err) => {
        if (err) {
          console.error('Error in fallback handler:', err);
          // Don't return a 404, this might be a valid client route
          res.status(200).send('<!DOCTYPE html><html><head><title>Phoenix Automotive</title></head><body><div>Loading...</div></body></html>');
        }
      });
    } else {
      next();
    }
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