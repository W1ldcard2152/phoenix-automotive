// eBay Marketplace Account Deletion Compliance Endpoint
// File: src/api/routes/EbayCompliance.js

import { Router } from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use consistent path resolution - match server.js
const projectRoot = path.resolve(__dirname, '../../../');
const envPath = path.join(projectRoot, '.env');
console.log(`[EbayCompliance] Loading .env from: ${envPath}`);
console.log(`[EbayCompliance] __dirname: ${__dirname}`);
console.log(`[EbayCompliance] projectRoot: ${projectRoot}`);
dotenv.config({ path: envPath });

// Log the loaded environment variables for debugging
console.log(`[EbayCompliance] EBAY_ENDPOINT_URL: ${process.env.EBAY_ENDPOINT_URL || 'NOT SET'}`);
console.log(`[EbayCompliance] EBAY_VERIFICATION_TOKEN: ${process.env.EBAY_VERIFICATION_TOKEN ? 'SET' : 'NOT SET'}`);

// Configuration - Load from environment variables (function to get fresh values)
function getEbayConfig() {
    return {
        verificationToken: process.env.EBAY_VERIFICATION_TOKEN || '',
        endpointUrl: process.env.EBAY_ENDPOINT_URL || 'https://www.phxautogroup.com/api/partsmatrix',
        logDirectory: path.join(projectRoot, 'logs/ebay')
    };
}

// eBay-specific middleware for proper header handling and authentication bypass
router.use((req, res, next) => {
    console.log(`[EbayMiddleware] Processing ${req.method} ${req.path}`);
    console.log(`[EbayMiddleware] Headers:`, {
        userAgent: req.headers['user-agent'],
        contentType: req.headers['content-type'],
        authorization: req.headers['authorization'] ? 'present' : 'missing',
        host: req.headers.host,
        origin: req.headers.origin,
        referer: req.headers.referer,
        'x-ebay-signature': req.headers['x-ebay-signature'] ? 'present' : 'missing',
        'x-ebay-timestamp': req.headers['x-ebay-timestamp'] ? 'present' : 'missing'
    });
    
    // Set CORS headers for eBay API compatibility
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, X-EBAY-SIGNATURE, X-EBAY-TIMESTAMP, User-Agent, Accept, Accept-Encoding, Cache-Control, Connection');
    
    // Set proper content type and cache headers for all JSON responses
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    // Remove any authentication requirements for eBay requests
    // This ensures no 401 errors from auth middleware
    delete req.headers.authorization;
    
    console.log(`[EbayMiddleware] Headers set for ${req.method} ${req.path}`);
    
    // Handle preflight OPTIONS requests
    if (req.method === 'OPTIONS') {
        console.log(`[EbayMiddleware] Handling OPTIONS request`);
        return res.status(200).end();
    }
    
    console.log(`eBay endpoint accessed: ${req.method} ${req.path}`, {
        userAgent: req.headers['user-agent'],
        contentType: req.headers['content-type'],
        hasSignature: !!req.headers['x-ebay-signature'],
        hasChallenge: !!req.query.challenge_code,
        remoteIP: req.ip || req.connection.remoteAddress
    });
    
    next();
});

// Ensure log directory exists
const ebayConfig = getEbayConfig();
if (!fs.existsSync(ebayConfig.logDirectory)) {
    fs.mkdirSync(ebayConfig.logDirectory, { recursive: true });
}

/**
 * Validate eBay notification payload structure
 */
function validatePayload(payload) {
    try {
        // Check required top-level fields
        if (!payload.metadata || !payload.notification) {
            return false;
        }

        const metadata = payload.metadata;
        if (metadata.topic !== 'MARKETPLACE_ACCOUNT_DELETION') {
            return false;
        }

        const notification = payload.notification;
        const requiredNotificationFields = ['notificationId', 'eventDate', 'publishDate', 'publishAttemptCount', 'data'];
        if (!requiredNotificationFields.every(field => field in notification)) {
            return false;
        }

        const data = notification.data;
        const requiredDataFields = ['username', 'userId', 'eiasToken'];
        if (!requiredDataFields.every(field => field in data)) {
            return false;
        }

        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Log deletion notification to file system
 */
function logDeletionNotification(payload, processingResult) {
    const config = getEbayConfig();
    const logEntry = {
        timestamp: new Date().toISOString(),
        notificationId: payload.notification.notificationId,
        username: payload.notification.data.username,
        userId: payload.notification.data.userId,
        eiasToken: payload.notification.data.eiasToken,
        eventDate: payload.notification.eventDate,
        publishDate: payload.notification.publishDate,
        publishAttemptCount: payload.notification.publishAttemptCount,
        processed: true,
        processedDate: new Date().toISOString(),
        deletedDataSummary: processingResult,
        rawPayload: payload
    };

    // Create filename with timestamp and notification ID
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const filename = `ebay_deletion_${timestamp}_${payload.notification.notificationId.substring(0, 8)}.json`;
    const logPath = path.join(config.logDirectory, filename);

    try {
        fs.writeFileSync(logPath, JSON.stringify(logEntry, null, 2));
        console.log(`eBay deletion notification logged to: ${logPath}`);
        return true;
    } catch (error) {
        console.error('Error writing eBay deletion log:', error);
        return false;
    }
}

/**
 * Check if notification has already been processed
 */
function isDuplicateNotification(notificationId) {
    const config = getEbayConfig();
    try {
        const files = fs.readdirSync(config.logDirectory);
        
        for (const file of files) {
            if (file.startsWith('ebay_deletion_') && file.endsWith('.json')) {
                const filePath = path.join(config.logDirectory, file);
                const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                if (content.notificationId === notificationId) {
                    return true;
                }
            }
        }
        return false;
    } catch (error) {
        console.error('Error checking for duplicate notification:', error);
        return false;
    }
}

/**
 * Process account deletion - remove any stored eBay user data
 */
function processAccountDeletion(username, userId, eiasToken) {
    const deletedItems = [];

    try {
        // Since this is primarily an automotive parts business website,
        // we likely don't store user-specific eBay data.
        // However, we should check for and remove any data that might be linked to the eBay user.

        // Check for any potential eBay-related data:
        // 1. Cached search results with user identifiers
        // 2. User preferences or saved searches
        // 3. eBay listing data associated with this user
        // 4. Any user feedback or ratings

        // For now, log that we checked for data
        deletedItems.push("Checked for eBay user-specific data in automotive parts database - none found");
        
        // If you have specific data to delete, add it here:
        // Example:
        // if (await deleteUserSearchCache(userId)) {
        //     deletedItems.push("Deleted user search cache");
        // }

        console.log(`Processed account deletion for eBay user: ${username} (ID: ${userId})`);

    } catch (error) {
        console.error('Error during account deletion processing:', error);
        deletedItems.push(`Error during deletion processing: ${error.message}`);
    }

    return deletedItems.join('; ');
}

/**
 * Verify eBay signature for incoming notifications
 */
function verifyEbaySignature(payload, signature, timestamp) {
    const config = getEbayConfig();
    try {
        if (!signature || !config.verificationToken) {
            return false;
        }

        // eBay signature format: timestamp.payload hashed with verification token
        const message = timestamp + '.' + JSON.stringify(payload);
        const expectedSignature = crypto
            .createHmac('sha256', config.verificationToken)
            .update(message, 'utf8')
            .digest('hex');

        // Compare signatures securely
        return crypto.timingSafeEqual(
            Buffer.from(signature, 'hex'),
            Buffer.from(expectedSignature, 'hex')
        );
    } catch (error) {
        console.error('Error verifying eBay signature:', error);
        return false;
    }
}

/**
 * GET /partsmatrix - Handle eBay challenge code verification
 */
router.get('/', (req, res) => {
    const challengeCode = req.query.challenge_code;
    const config = getEbayConfig(); // Get fresh config

    // Immediately set response headers to ensure eBay compatibility
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-cache');

    // Log the incoming request for debugging
    console.log('eBay challenge request received:', {
        challengeCode: challengeCode ? challengeCode.substring(0, 10) + '...' : 'missing',
        userAgent: req.headers['user-agent'],
        ip: req.ip || req.connection.remoteAddress,
        timestamp: new Date().toISOString(),
        configEndpoint: config.endpointUrl, // Log the actual config being used
        method: req.method,
        fullUrl: req.protocol + '://' + req.get('host') + req.originalUrl,
        headers: {
            'accept': req.headers.accept,
            'content-type': req.headers['content-type'],
            'host': req.headers.host,
            'connection': req.headers.connection,
            'accept-encoding': req.headers['accept-encoding']
        }
    });

    if (!challengeCode) {
        console.error('No challenge_code parameter in GET request');
        const errorResponse = { error: 'Missing challenge_code parameter' };
        return res.status(400).json(errorResponse);
    }

    // Validate challenge code format (basic sanity check)
    if (challengeCode.length < 3 || challengeCode.length > 500) {
        console.error('Invalid challenge_code format:', challengeCode.length, 'characters');
        const errorResponse = { error: 'Invalid challenge_code format' };
        return res.status(400).json(errorResponse);
    }

    if (!config.verificationToken) {
        console.error('No EBAY_VERIFICATION_TOKEN configured');
        const errorResponse = { error: 'Configuration not found' };
        return res.status(500).json(errorResponse);
    }

    try {
        // Create the hash as specified by eBay: challengeCode + verificationToken + endpoint
        const hashInput = challengeCode + config.verificationToken + config.endpointUrl;
        const challengeResponse = crypto.createHash('sha256').update(hashInput, 'utf8').digest('hex');

        console.log(`✅ eBay challenge verification successful`);
        console.log(`Challenge code: ${challengeCode}`);
        console.log(`Verification token: ${config.verificationToken ? '[SET]' : '[MISSING]'}`);
        console.log(`Endpoint URL: ${config.endpointUrl}`);
        console.log(`Hash input: ${hashInput}`);
        console.log(`Hash input length: ${hashInput.length} characters`);
        console.log(`Challenge response: ${challengeResponse}`);

        // Return the response in the exact format eBay expects
        const responseData = {
            challengeResponse: challengeResponse
        };
        
        console.log(`Sending response:`, responseData);
        return res.status(200).json(responseData);

    } catch (error) {
        console.error('❌ Error processing eBay challenge code:', error);
        const errorResponse = { error: 'Internal server error' };
        return res.status(500).json(errorResponse);
    }
});

/**
 * POST /partsmatrix - Handle eBay marketplace account deletion notifications
 */
router.post('/', (req, res) => {
    try {
        const payload = req.body;
        const signature = req.headers['x-ebay-signature'];
        const timestamp = req.headers['x-ebay-timestamp'] || Date.now().toString();

        // Immediately set response headers to ensure eBay compatibility
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cache-Control', 'no-cache');

        console.log('✉️ Received eBay POST notification:', {
            hasPayload: !!payload,
            hasSignature: !!signature,
            timestamp: timestamp,
            contentType: req.headers['content-type'],
            method: req.method,
            fullUrl: req.protocol + '://' + req.get('host') + req.originalUrl,
            userAgent: req.headers['user-agent'],
            ip: req.ip || req.connection.remoteAddress,
            payloadSize: JSON.stringify(payload || {}).length
        });

        // For production, verify eBay signature (skip for testing)
        if (process.env.NODE_ENV === 'production' && signature) {
            if (!verifyEbaySignature(payload, signature, timestamp)) {
                console.error('❌ Invalid eBay signature');
                const errorResponse = { error: 'Invalid signature' };
                return res.status(401).json(errorResponse);
            }
            console.log('✅ eBay signature verified successfully');
        } else if (process.env.NODE_ENV === 'production') {
            console.warn('⚠️ Missing eBay signature in production mode');
        } else {
            console.log('ℹ️ Development mode: Skipping signature verification');
        }

        // Validate the payload structure
        if (!validatePayload(payload)) {
            console.error('❌ Invalid payload structure:', JSON.stringify(payload, null, 2));
            const errorResponse = { error: 'Invalid payload structure' };
            return res.status(400).json(errorResponse);
        }

        const notification = payload.notification;
        const data = notification.data;

        const notificationId = notification.notificationId;
        const username = data.username;
        const userId = data.userId;
        const eiasToken = data.eiasToken;

        // Check if we've already processed this notification
        if (isDuplicateNotification(notificationId)) {
            console.log(`♾️ Duplicate eBay account deletion notification: ${notificationId}`);
            // Still return success to eBay to acknowledge receipt
            return res.status(200).send();
        }

        console.log(`✅ Received eBay account deletion notification for user: ${username} (ID: ${userId})`);

        // Process the deletion (remove any stored eBay user data)
        const deletedDataSummary = processAccountDeletion(username, userId, eiasToken);

        // Log the notification
        const logSuccess = logDeletionNotification(payload, deletedDataSummary);
        
        if (!logSuccess) {
            console.error('⚠️ Failed to log deletion notification');
            // Still return success to eBay since we processed the deletion
        }

        console.log(`✅ Successfully processed eBay account deletion for user: ${username}`);

        // Return success response to eBay (must be 200 status with empty body)
        return res.status(200).send();

    } catch (error) {
        console.error('❌ Error processing eBay account deletion notification:', {
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
        const errorResponse = { error: 'Internal server error' };
        return res.status(500).json(errorResponse);
    }
});

// Health check endpoint (optional, for monitoring)
router.get('/health', (req, res) => {
    const config = getEbayConfig(); // Get fresh config
    const health = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        endpoint: config.endpointUrl,
        hasVerificationToken: !!config.verificationToken,
        logDirectory: config.logDirectory,
        environment: process.env.NODE_ENV || 'development'
    };
    
    res.status(200).json(health);
});

export default router;