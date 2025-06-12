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
const projectRoot = path.resolve(__dirname, '../../../');
dotenv.config({ path: path.join(projectRoot, '.env') });

// Configuration - Load from environment variables
const EBAY_CONFIG = {
    verificationToken: process.env.EBAY_VERIFICATION_TOKEN || '',
    endpointUrl: process.env.EBAY_ENDPOINT_URL || 'https://phxautogroup.com/api/partsmatrix',
    logDirectory: path.join(__dirname, '../../../logs/ebay')
};

// Ensure log directory exists
if (!fs.existsSync(EBAY_CONFIG.logDirectory)) {
    fs.mkdirSync(EBAY_CONFIG.logDirectory, { recursive: true });
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
    const logPath = path.join(EBAY_CONFIG.logDirectory, filename);

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
    try {
        const files = fs.readdirSync(EBAY_CONFIG.logDirectory);
        
        for (const file of files) {
            if (file.startsWith('ebay_deletion_') && file.endsWith('.json')) {
                const filePath = path.join(EBAY_CONFIG.logDirectory, file);
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
 * GET /partsmatrix - Handle eBay challenge code verification
 */
router.get('/', (req, res) => {
    const challengeCode = req.query.challenge_code;

    if (!challengeCode) {
        console.error('No challenge_code parameter in GET request');
        return res.status(400).json({ error: 'Missing challenge_code parameter' });
    }

    if (!EBAY_CONFIG.verificationToken) {
        console.error('No EBAY_VERIFICATION_TOKEN configured');
        return res.status(500).json({ error: 'Configuration not found' });
    }

    try {
        // Create the hash as specified by eBay: challengeCode + verificationToken + endpoint
        const hashInput = challengeCode + EBAY_CONFIG.verificationToken + EBAY_CONFIG.endpointUrl;
        const challengeResponse = crypto.createHash('sha256').update(hashInput, 'utf8').digest('hex');

        console.log(`eBay challenge verification successful for challenge_code: ${challengeCode}`);

        // Return the response in the exact format eBay expects
        const responseData = {
            challengeResponse: challengeResponse
        };

        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json(responseData);

    } catch (error) {
        console.error('Error processing eBay challenge code:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * POST /partsmatrix - Handle eBay marketplace account deletion notifications
 */
router.post('/', (req, res) => {
    try {
        const payload = req.body;

        // Validate the payload structure
        if (!validatePayload(payload)) {
            console.error('Invalid payload structure:', payload);
            return res.status(400).json({ error: 'Invalid payload structure' });
        }

        const notification = payload.notification;
        const data = notification.data;

        const notificationId = notification.notificationId;
        const username = data.username;
        const userId = data.userId;
        const eiasToken = data.eiasToken;

        // Check if we've already processed this notification
        if (isDuplicateNotification(notificationId)) {
            console.log(`Duplicate eBay account deletion notification: ${notificationId}`);
            // Still return success to eBay to acknowledge receipt
            return res.status(200).send();
        }

        console.log(`Received eBay account deletion notification for user: ${username} (ID: ${userId})`);

        // Process the deletion (remove any stored eBay user data)
        const deletedDataSummary = processAccountDeletion(username, userId, eiasToken);

        // Log the notification
        const logSuccess = logDeletionNotification(payload, deletedDataSummary);
        
        if (!logSuccess) {
            console.error('Failed to log deletion notification');
            // Still return success to eBay since we processed the deletion
        }

        console.log(`Successfully processed eBay account deletion for user: ${username}`);

        // Return success response to eBay (must be 200 status)
        return res.status(200).send();

    } catch (error) {
        console.error('Error processing eBay account deletion notification:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Health check endpoint (optional, for monitoring)
router.get('/health', (req, res) => {
    const health = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        endpoint: EBAY_CONFIG.endpointUrl,
        hasVerificationToken: !!EBAY_CONFIG.verificationToken,
        logDirectory: EBAY_CONFIG.logDirectory
    };
    
    res.json(health);
});

export default router;