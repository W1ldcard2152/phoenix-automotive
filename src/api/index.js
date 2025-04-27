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
import { authenticateToken } from './middleware/auth.js';

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

// Mount routes
console.log('Mounting routes...');

// Public routes
router.use('/auth', authRouter);
router.use('/vin', vinValidationRouter);

// Protected admin routes
router.use('/dismantled-vehicles', authenticateToken, dismantledVehiclesRouter);
router.use('/retail-vehicles', authenticateToken, retailVehiclesRouter);
router.use('/part-requests', authenticateToken, partRequestsRouter);
router.use('/repair-requests', authenticateToken, repairRequestsRouter);

// Protected image upload route
router.post('/upload', authenticateToken, upload.single('image'), async (req, res) => {
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