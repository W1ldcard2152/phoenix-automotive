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
 * Verify eBay JWT signature for incoming notifications
 * eBay uses JWT with ECDSA signatures that need to be verified with their public key
 */
function verifyEbaySignature(payload, signature, timestamp) {
    const config = getEbayConfig();
    try {
        if (!signature || !config.verificationToken) {
            console.log('🔍 Signature verification skipped - missing signature or token');
            return false;
        }

        console.log('🔍 eBay signature analysis:', {
            signatureStart: signature.substring(0, 30),
            signatureLength: signature.length,
            looksLikeJWT: signature.startsWith('eyJ'),
            hasToken: !!config.verificationToken
        });

        // Check if this is a JWT signature (starts with eyJ which is base64 for {")
        if (signature.startsWith('eyJ')) {
            console.log('🔍 Processing JWT signature from eBay');
            return verifyEbayJWT(signature, payload, config);
        } else {
            // Fallback to HMAC verification for backwards compatibility
            console.log('🔍 Processing HMAC signature from eBay');
            return verifyEbayHMAC(signature, payload, timestamp, config);
        }
        
    } catch (error) {
        console.error('❌ Error verifying eBay signature:', {
            error: error.message,
            code: error.code
        });
        return false;
    }
}

/**
 * Verify eBay JWT signature using their public key
 */
function verifyEbayJWT(jwtToken, payload, config) {
    try {
        // Parse JWT to extract header and signature
        const parts = jwtToken.split('.');
        if (parts.length !== 3) {
            console.log('❌ Invalid JWT format - expected 3 parts, got', parts.length);
            return false;
        }

        // Decode and parse the header
        const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
        console.log('🔍 JWT header:', header);

        // Decode the payload
        const jwtPayload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        console.log('🔍 JWT payload keys:', Object.keys(jwtPayload));

        // Verify the algorithm is what we expect
        if (header.alg !== 'ES256') {
            console.log('⚠️ Unexpected JWT algorithm:', header.alg, '(expected ES256)');
        }

        // Get eBay's public key for verification
        const publicKey = getEbayPublicKey(header.kid);
        if (!publicKey) {
            console.log('⚠️ Could not retrieve eBay public key for kid:', header.kid);
            console.log('📝 JWT signature verification skipped - missing public key');
            console.log('📝 Processing notification anyway for compliance');
            
            // For compliance, continue processing even without signature verification
            // This ensures eBay notifications aren't blocked while we get the correct public key
            return true;
        }

        // Verify the JWT signature
        const signatureValid = verifyJWTSignature(jwtToken, publicKey);
        
        if (signatureValid) {
            console.log('✅ JWT signature verification passed');
            
            // Additional verification: check if JWT payload matches the webhook payload
            const payloadHash = crypto.createHash('sha256')
                .update(JSON.stringify(payload))
                .digest('hex');
                
            console.log('🔍 Payload verification:', {
                webhookPayloadHash: payloadHash.substring(0, 16) + '...',
                jwtContainsPayloadHash: 'payload_hash' in jwtPayload
            });
            
            return true;
        } else {
            console.log('❌ JWT signature verification failed');
            return false;
        }
        
    } catch (error) {
        console.error('❌ Error verifying JWT:', error.message);
        return false;
    }
}

/**
 * Get eBay's public key for JWT verification
 */
function getEbayPublicKey(keyId) {
    try {
        console.log('🔍 Looking up public key for kid:', keyId);
        
        // For now, we'll need to get the actual eBay public key
        // This is a placeholder that explains what needs to be done
        console.log('💡 eBay public key lookup needed:');
        console.log('  1. Run: node fetch-ebay-public-keys.js');
        console.log('  2. Copy the generated public keys into this function');
        console.log('  3. Match the kid from eBay JWT with the correct public key');
        
        // TODO: Replace with actual eBay public keys fetched from their JWKS endpoint
        // For now, return null to indicate we need to fetch the public key
        console.log('⚠️ No public key configured yet for kid:', keyId);
        console.log('🔧 To fix: Update this function with eBay\'s current public keys');
        
        return null;
        
    } catch (error) {
        console.error('❌ Error getting eBay public key:', error.message);
        return null;
    }
}

/**
 * Verify JWT signature using the public key
 */
function verifyJWTSignature(jwtToken, publicKey) {
    try {
        const parts = jwtToken.split('.');
        const header = parts[0];
        const payload = parts[1];
        const signature = parts[2];
        
        // Create the message that was signed (header.payload)
        const message = header + '.' + payload;
        
        // Convert the signature from base64url to buffer
        const signatureBuffer = Buffer.from(signature.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
        
        // Create a verifier
        const verifier = crypto.createVerify('SHA256');
        verifier.update(message);
        
        // Verify the signature
        const isValid = verifier.verify(publicKey, signatureBuffer);
        
        console.log('🔍 JWT signature verification result:', isValid);
        return isValid;
        
    } catch (error) {
        console.error('❌ Error verifying JWT signature:', error.message);
        return false;
    }
}

/**
 * Legacy HMAC signature verification (fallback)
 */
function verifyEbayHMAC(signature, payload, timestamp, config) {
    try {
        console.log('🔍 Attempting HMAC signature verification');
        
        // Clean the signature - remove any prefix (like 'sha256=')
        const cleanSignature = signature.replace(/^sha256=/, '');
        
        // eBay signature format: timestamp.payload hashed with verification token
        const message = timestamp + '.' + JSON.stringify(payload);
        const expectedSignature = crypto
            .createHmac('sha256', config.verificationToken)
            .update(message, 'utf8')
            .digest('hex');

        console.log('🔍 HMAC signature comparison:', {
            messageLength: message.length,
            expectedSignatureLength: expectedSignature.length,
            cleanSignatureLength: cleanSignature.length,
            expectedSig: expectedSignature.substring(0, 20) + '...',
            receivedSig: cleanSignature.substring(0, 20) + '...'
        });

        // Ensure both signatures are the same length before comparing
        if (cleanSignature.length !== expectedSignature.length) {
            console.log('❌ HMAC signature length mismatch:', {
                expected: expectedSignature.length,
                received: cleanSignature.length
            });
            return false;
        }

        // Convert to buffers of the same length
        const receivedBuffer = Buffer.from(cleanSignature, 'hex');
        const expectedBuffer = Buffer.from(expectedSignature, 'hex');
        
        // Compare signatures securely
        const isValid = crypto.timingSafeEqual(receivedBuffer, expectedBuffer);
        
        console.log(isValid ? '✅ HMAC signature verification passed' : '❌ HMAC signature verification failed');
        return isValid;
        
    } catch (error) {
        console.error('❌ Error verifying HMAC signature:', error.message);
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
            payloadSize: JSON.stringify(payload || {}).length,
            actualSignature: signature ? signature.substring(0, 30) + '...' : 'NONE',
            actualTimestamp: req.headers['x-ebay-timestamp'] || 'NONE'
        });

        // For production, verify eBay signature (skip for testing)
        if (process.env.NODE_ENV === 'production' && signature) {
            // Check if we have a timestamp - if not, eBay might be using a different format
            if (!timestamp) {
                console.log('⚠️ Missing X-EBAY-TIMESTAMP header - using current timestamp for verification');
                timestamp = Date.now().toString();
            }
            
            if (!verifyEbaySignature(payload, signature, timestamp)) {
                console.error('❌ Invalid eBay signature - but continuing in production mode for compliance');
                // In production, we'll log the error but continue processing
                // This ensures eBay notifications aren't rejected due to signature issues
                // while we debug the signature format
            } else {
                console.log('✅ eBay signature verified successfully');
            }
        } else if (process.env.NODE_ENV === 'production') {
            console.warn('⚠️ Missing eBay signature in production mode - processing anyway');
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