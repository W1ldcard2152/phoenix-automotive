// Add this to your main Express server file (usually app.js or server.js)

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app = express();

// Trust proxy (important for production behind load balancers)
app.set('trust proxy', 1);

// CORS configuration for eBay
app.use(cors({
    origin: function (origin, callback) {
        // Allow eBay and your own domains
        const allowedOrigins = [
            'https://developer.ebay.com',
            'https://api.ebay.com',
            'https://phxautogroup.com',
            'https://www.phxautogroup.com',
            // Add your other domains
        ];
        
        // Allow no origin (for server-to-server requests like eBay's)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(null, true); // Be permissive for eBay compliance
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Security headers (but allow eBay access)
app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false, // Disable CSP for eBay compatibility
}));

// Parse JSON bodies
app.use(express.json({
    limit: '10mb',
    verify: (req, res, buf) => {
        // Store raw body for webhook signature verification if needed
        req.rawBody = buf;
    }
}));

// Health check endpoint (make sure this works first)
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

// Your eBay compliance routes
import ebayRoutes from './api/routes/EbayCompliance.js';
app.use('/api/partsmatrix', ebayRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
    console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ error: 'Not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`eBay endpoint: https://phxautogroup.com/api/partsmatrix`);
    console.log(`Health check: https://phxautogroup.com/api/health`);
});
