import { Router } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dismantledVehiclesRouter from './routes/DismantledVehicles.js';
import retailVehiclesRouter from './routes/RetailVehicles.js';
import partRequestsRouter from './routes/PartRequests.js';
import repairRequestsRouter from './routes/RepairRequests.js';
import vinValidationRouter from './routes/validateVin.js';
import authRouter from './routes/Auth.js';
import ebayComplianceRouter from './routes/EbayCompliance.js'; // NEW IMPORT
import { authenticateToken } from './middleware/auth.js';
import { csrfProtection } from './middleware/csrf.js';
import { securityHeaders, rateLimit } from './middleware/security.js';
import vehicleDataRouter from './routes/VehicleData.js';

const router = Router();

// Get current directory and project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../');

// Load environment variables
dotenv.config({ path: path.join(projectRoot, '.env') });

// Cloudinary configuration validator
const validateCloudinaryConfig = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  const config = cloudinary.config();
  const configCheck = {
    hasCloudName: !!config.cloud_name,
    hasApiKey: !!config.api_key,
    hasApiSecret: !!config.api_secret,
    cloudName: config.cloud_name ? 'set' : 'missing',
    apiKey: config.api_key ? 'set' : 'missing',
    apiSecret: config.api_secret ? 'set' : 'missing'
  };

  console.log('Cloudinary Configuration Check:', configCheck);

  if (!configCheck.hasCloudName || !configCheck.hasApiKey || !configCheck.hasApiSecret) {
    throw new Error('Missing required Cloudinary configuration');
  }

  return config;
};

// Initialize Cloudinary
validateCloudinaryConfig();

// Configure multer-storage-cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'vehicles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1000, height: 750, crop: 'limit' }],
    resource_type: 'auto',
    format: 'jpg'
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Apply global middleware
router.use(securityHeaders);
router.use(rateLimit);

// Mount routes
console.log('Mounting routes...');

// eBay compliance endpoint - must be BEFORE other middleware that might interfere
// This endpoint needs to be accessible without authentication or CSRF protection
router.use('/partsmatrix', ebayComplianceRouter);

// Public routes
router.use('/vehicle-data', vehicleDataRouter);
router.use('/auth', csrfProtection, authRouter);
router.use('/vin', vinValidationRouter);

// Modified route handling for dismantled vehicles - public GET access
router.get('/dismantled-vehicles', async (req, res, next) => {
  try {
    // Forward to the dismantled vehicles router's handler
    req.url = '/'; // Reset the URL for the forwarded request
    dismantledVehiclesRouter.handle(req, res, next);
  } catch (error) {
    next(error);
  }
});

// Modified route handling for retail vehicles - public GET access
router.get('/retail-vehicles', async (req, res, next) => {
  try {
    // Forward to the retail vehicles router's handler
    req.url = '/'; // Reset the URL for the forwarded request
    retailVehiclesRouter.handle(req, res, next);
  } catch (error) {
    next(error);
  }
});

// Get single dismantled vehicle - public route
router.get('/dismantled-vehicles/:id', (req, res, next) => {
  // Forward to the dismantled vehicles router's handler
  const originalUrl = req.url;
  req.url = `/${req.params.id}`; // Reset the URL for the forwarded request
  dismantledVehiclesRouter.handle(req, res, (err) => {
    if (err) {
      req.url = originalUrl; // Restore original URL if there's an error
      next(err);
    }
  });
});

// Get single retail vehicle - public route
router.get('/retail-vehicles/:id', (req, res, next) => {
  // Forward to the retail vehicles router's handler
  const originalUrl = req.url;
  req.url = `/${req.params.id}`; // Reset the URL for the forwarded request
  retailVehiclesRouter.handle(req, res, (err) => {
    if (err) {
      req.url = originalUrl; // Restore original URL if there's an error
      next(err);
    }
  });
});

// Create part request - public route
router.post('/part-requests', async (req, res, next) => {
  try {
    // Forward to the part requests router's handler
    req.url = '/'; 
    partRequestsRouter.handle(req, res, next);
  } catch (error) {
    next(error);
  }
});

// Handle OPTIONS preflight requests for repair requests
router.options('/repair-requests', (req, res) => {
  res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(204).end();
});

// Create repair request - public route
router.post('/repair-requests', async (req, res, next) => {
  try {
    // Set CORS headers for this specific endpoint
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    // Forward to the repair requests router's handler
    req.url = '/'; 
    repairRequestsRouter.handle(req, res, next);
  } catch (error) {
    next(error);
  }
});

// Protected admin routes - moved to /admin prefix
router.use('/admin/dismantled-vehicles', csrfProtection, authenticateToken, dismantledVehiclesRouter);
router.use('/admin/retail-vehicles', csrfProtection, authenticateToken, retailVehiclesRouter);
router.use('/admin/part-requests', csrfProtection, authenticateToken, partRequestsRouter);
router.use('/admin/repair-requests', csrfProtection, authenticateToken, repairRequestsRouter);

// Protected image upload route
router.post('/admin/upload', csrfProtection, authenticateToken, upload.single('image'), async (req, res) => {
  try {
    console.log('Upload request received:', {
      hasFile: !!req.file,
      contentType: req.headers['content-type'],
      fileDetails: req.file
    });

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Check if we have the necessary Cloudinary response properties
    if (!req.file.path) {
      console.error('Missing Cloudinary path in response:', req.file);
      throw new Error('Invalid Cloudinary response');
    }

    // Construct secure URL if not provided
    const secureUrl = req.file.secure_url || req.file.path.replace('http://', 'https://');
    
    console.log('File upload successful:', {
      path: req.file.path,
      secureUrl: secureUrl,
      publicId: req.file.public_id
    });

    res.json({
      url: secureUrl,
      public_id: req.file.public_id
    });
  } catch (error) {
    console.error('Upload error details:', {
      message: error.message,
      stack: error.stack,
      fileInfo: req.file
    });

    res.status(500).json({
      error: 'Failed to upload image',
      details: error.message
    });
  }
});

// Error handling middleware
router.use((err, req, res, next) => {
  console.error('Router error:', {
    message: err.message,
    stack: err.stack,
    path: req.path
  });

  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({ 
    error: err.message,
    path: req.path
  });
});

console.log('Routes mounted successfully');

export default router;