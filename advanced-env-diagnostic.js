// Advanced Environment Diagnostic
// This will help us figure out exactly what's happening with environment loading

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Advanced Environment Diagnostic');
console.log('=' .repeat(50));

// Test 1: Check working directory and paths
console.log('\n1. 📂 Path Information:');
console.log(`   Current working directory: ${process.cwd()}`);
console.log(`   Script directory: ${__dirname}`);
console.log(`   Script filename: ${__filename}`);

// Test 2: Check for multiple .env files
console.log('\n2. 🔍 Searching for .env files:');
const possibleEnvPaths = [
    path.join(__dirname, '.env'),
    path.join(process.cwd(), '.env'),
    path.join(__dirname, '../', '.env'),
    path.join(__dirname, '../../', '.env'),
    path.join(__dirname, '../../../', '.env'),
];

possibleEnvPaths.forEach((envPath, index) => {
    try {
        if (fs.existsSync(envPath)) {
            const stats = fs.statSync(envPath);
            console.log(`   ✅ Found .env #${index + 1}: ${envPath}`);
            console.log(`      Modified: ${stats.mtime}`);
            console.log(`      Size: ${stats.size} bytes`);
            
            // Read and show eBay lines
            const content = fs.readFileSync(envPath, 'utf8');
            const ebayLines = content.split('\n').filter(line => 
                line.includes('EBAY') && !line.startsWith('#') && line.trim()
            );
            ebayLines.forEach(line => {
                console.log(`      ${line}`);
            });
        } else {
            console.log(`   ❌ Not found: ${envPath}`);
        }
    } catch (error) {
        console.log(`   ❌ Error checking ${envPath}: ${error.message}`);
    }
});

// Test 3: Test different loading methods
console.log('\n3. 🧪 Testing different .env loading methods:');

// Clear environment first
delete process.env.EBAY_VERIFICATION_TOKEN;
delete process.env.EBAY_ENDPOINT_URL;

// Method 1: No path specified (default behavior)
console.log('\n   Method 1: dotenv.config() (default)');
dotenv.config();
console.log(`   EBAY_ENDPOINT_URL: ${process.env.EBAY_ENDPOINT_URL || 'NOT SET'}`);

// Clear and try method 2
delete process.env.EBAY_VERIFICATION_TOKEN;
delete process.env.EBAY_ENDPOINT_URL;

// Method 2: Explicit path like server.js
console.log('\n   Method 2: Like server.js');
const serverPath = path.resolve(__dirname, '../');
const serverEnvPath = path.join(serverPath, '.env');
console.log(`   Loading from: ${serverEnvPath}`);
dotenv.config({ path: serverEnvPath });
console.log(`   EBAY_ENDPOINT_URL: ${process.env.EBAY_ENDPOINT_URL || 'NOT SET'}`);

// Clear and try method 3
delete process.env.EBAY_VERIFICATION_TOKEN;
delete process.env.EBAY_ENDPOINT_URL;

// Method 3: Like EbayCompliance.js
console.log('\n   Method 3: Like EbayCompliance.js');
const ebayPath = path.resolve(__dirname, '../../../');
const ebayEnvPath = path.join(ebayPath, '.env');
console.log(`   Loading from: ${ebayEnvPath}`);
dotenv.config({ path: ebayEnvPath });
console.log(`   EBAY_ENDPOINT_URL: ${process.env.EBAY_ENDPOINT_URL || 'NOT SET'}`);

// Test 4: Check what the actual server health endpoint returns
console.log('\n4. 🌐 Testing actual server health endpoint:');

const healthOptions = {
    hostname: 'www.phxautogroup.com',
    port: 443,
    path: '/api/partsmatrix/health',
    method: 'GET',
    headers: {
        'User-Agent': 'DiagnosticTest/1.0'
    }
};

const req = https.request(healthOptions, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            const healthData = JSON.parse(data);
            console.log('   ✅ Server health response:');
            console.log(`   Endpoint: ${healthData.endpoint}`);
            console.log(`   Environment: ${healthData.environment}`);
            console.log(`   Has Token: ${healthData.hasVerificationToken}`);
            
            // Test hash calculation with server's endpoint
            console.log('\n5. 🧮 Hash calculation test with server endpoint:');
            const testChallenge = 'diagnostic_test_12345';
            const crypto = await import('crypto');
            
            // Using server's endpoint
            const serverHashInput = testChallenge + process.env.EBAY_VERIFICATION_TOKEN + healthData.endpoint;
            const serverHash = crypto.createHash('sha256').update(serverHashInput, 'utf8').digest('hex');
            
            // Using our expected endpoint
            const expectedEndpoint = 'https://www.phxautogroup.com/api/partsmatrix';
            const expectedHashInput = testChallenge + process.env.EBAY_VERIFICATION_TOKEN + expectedEndpoint;
            const expectedHash = crypto.createHash('sha256').update(expectedHashInput, 'utf8').digest('hex');
            
            console.log(`   Test challenge: ${testChallenge}`);
            console.log(`   Token: ${process.env.EBAY_VERIFICATION_TOKEN ? 'SET' : 'NOT SET'}`);
            console.log('');
            console.log(`   Server endpoint: ${healthData.endpoint}`);
            console.log(`   Server hash: ${serverHash}`);
            console.log('');
            console.log(`   Expected endpoint: ${expectedEndpoint}`);
            console.log(`   Expected hash: ${expectedHash}`);
            console.log('');
            
            if (serverHash === expectedHash) {
                console.log('   ✅ Hashes match! No endpoint URL issue.');
            } else {
                console.log('   ❌ Hash mismatch! Server using different endpoint.');
                console.log('   🔧 Fix: Update server to use correct endpoint URL');
            }
            
        } catch (error) {
            console.log(`   ❌ Error parsing health response: ${error.message}`);
            console.log(`   Raw response: ${data}`);
        }
    });
});

req.on('error', (error) => {
    console.log(`   ❌ Health check request failed: ${error.message}`);
});

req.end();
