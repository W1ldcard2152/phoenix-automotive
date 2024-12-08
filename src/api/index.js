import { Router } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dismantledVehiclesRouter from './routes/DismantledVehicles.js';
import retailVehiclesRouter from './routes/RetailVehicles.js';
import partRequestsRouter from './routes/PartRequests.js';

const router = Router();

// Configure Cloudinary
const cloudinaryConfig = cloudinary.config();
console.log('Cloudinary Configuration Check:', {
  hasCloudName: !!cloudinaryConfig.cloud_name,
  hasApiKey: !!cloudinaryConfig.api_key,
  hasApiSecret: !!cloudinaryConfig.api_secret,
  cloudName: cloudinaryConfig.cloud_name ? 'set' : 'missing',
  apiKey: cloudinaryConfig.api_key ? 'set' : 'missing',
  apiSecret: cloudinaryConfig.api_secret ? 'set' : 'missing'
});

// Add this right after cloudinary.config()
console.log('Cloudinary Configuration:', {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Missing',
  apiKey: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Missing',
  apiSecret: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Missing'
});

// Configure multer-storage-cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'vehicles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1000, height: 750, crop: 'limit' }],
    resource_type: 'auto',
    format: 'jpg' // Add this to ensure consistent format
  }
});

const upload = multer({ storage: storage });

// Mount the routers at their respective paths
console.log('Mounting routes...');
router.use('/dismantled-vehicles', dismantledVehiclesRouter);
router.use('/retail-vehicles', retailVehiclesRouter);
router.use('/part-requests', partRequestsRouter);

// Image upload route
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    console.log('Upload request received:', {
      hasFile: !!req.file,
      contentType: req.headers['content-type'],
      fileDetails: req.file ? {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      } : null
    });

    // Check if file exists
    if (!req.file) {
      console.log('No file received in upload request');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Log Cloudinary configuration state
    console.log('Cloudinary config state:', {
      hasCloudName: !!cloudinary.config().cloud_name,
      hasApiKey: !!cloudinary.config().api_key,
      hasApiSecret: !!cloudinary.config().api_secret
    });

    // After successful upload
    console.log('File upload successful:', {
      path: req.file.path,
      url: req.file.secure_url
    });

    res.json({
      url: req.file.secure_url,
      public_id: req.file.public_id
    });
  } catch (error) {
    // Detailed error logging
    console.error('Upload error details:', {
      message: error.message,
      stack: error.stack,
      cloudinaryError: error.http_code ? true : false
    });

    res.status(500).json({
      error: 'Failed to upload image',
      details: error.message
    });
  }
});

// Error handling middleware
router.use((err, req, res, next) => {
  console.error('Router error:', err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({ error: err.message });
});

console.log('Routes mounted');

export default router;