// Server Environment Diagnostic
// This will help us figure out why the server isn't loading the new environment

import https from 'https';

console.log('🔍 Server Environment Diagnostic');
console.log('=' .repeat(50));

console.log('This test compares what we expect vs what the server actually has');

// Test 1: Check what our local environment loading produces
console.log('\n1. 📂 Local Environment Check:');
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, './');
const envPath = path.join(projectRoot, '.env');

console.log(`   Loading from: ${envPath}`);
dotenv.config({ path: envPath });

const localConfig = {
    endpointUrl: process.env.EBAY_ENDPOINT_URL || 'DEFAULT',
    hasToken: !!process.env.EBAY_VERIFICATION_TOKEN
};

console.log(`   Local EBAY_ENDPOINT_URL: ${localConfig.endpointUrl}`);
console.log(`   Local token present: ${localConfig.hasToken}`);

// Test 2: Check what the server reports
console.log('\n2. 🌐 Server Health Check:');

function checkServerHealth() {
    return new Promise((resolve) => {
        const options = {
            hostname: 'www.phxautogroup.com',
            port: 443,
            path: '/api/partsmatrix/health',
            method: 'GET'
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const serverConfig = JSON.parse(data);
                    console.log(`   Server endpoint: ${serverConfig.endpoint}`);
                    console.log(`   Server token present: ${serverConfig.hasVerificationToken}`);
                    console.log(`   Server environment: ${serverConfig.environment}`);
                    resolve(serverConfig);
                } catch (error) {
                    console.log(`   ❌ Failed to parse server response: ${error.message}`);
                    resolve(null);
                }
            });
        });

        req.on('error', (error) => {
            console.log(`   ❌ Server request failed: ${error.message}`);
            resolve(null);
        });

        req.end();
    });
}

// Test 3: Compare and analyze
checkServerHealth().then((serverConfig) => {
    console.log('\n3. 📊 Analysis:');
    
    if (!serverConfig) {
        console.log('   ❌ Cannot analyze - server health check failed');
        return;
    }
    
    const localEndpoint = localConfig.endpointUrl;
    const serverEndpoint = serverConfig.endpoint;
    
    console.log(`   Local endpoint:  ${localEndpoint}`);
    console.log(`   Server endpoint: ${serverEndpoint}`);
    
    if (localEndpoint === serverEndpoint) {
        console.log('   ✅ Endpoints match - configuration is in sync');
    } else {
        console.log('   ❌ Endpoints DO NOT match - server needs restart or deployment');
        
        if (serverEndpoint.includes('phxautogroup.com') && !serverEndpoint.includes('www.')) {
            console.log('   📝 Server is using old URL (without www)');
        }
        
        console.log('\n4. 🔧 Possible Solutions:');
        console.log('   a) Restart your server process');
        console.log('   b) If using PM2: pm2 restart all');
        console.log('   c) If using cloud platform: redeploy or restart');
        console.log('   d) Check if multiple server instances are running');
        console.log('   e) Verify .env file is in the server\'s working directory');
    }
    
    console.log('\n5. 🧪 Quick Hash Test:');
    const testChallenge = 'diagnostic_test_123';
    
    // What the test expects
    const crypto = await import('crypto');
    const expectedHashInput = testChallenge + process.env.EBAY_VERIFICATION_TOKEN + localConfig.endpointUrl;
    const expectedHash = crypto.createHash('sha256').update(expectedHashInput, 'utf8').digest('hex');
    
    // What the server would produce
    const serverHashInput = testChallenge + process.env.EBAY_VERIFICATION_TOKEN + serverConfig.endpoint;
    const serverHash = crypto.createHash('sha256').update(serverHashInput, 'utf8').digest('hex');
    
    console.log(`   Expected: ${expectedHash}`);
    console.log(`   Server:   ${serverHash}`);
    console.log(`   Match:    ${expectedHash === serverHash ? 'YES' : 'NO'}`);
    
    if (expectedHash !== serverHash) {
        console.log('\n   🎯 This confirms the hash mismatch issue!');
        console.log('   The server is using a different endpoint URL than expected.');
    }
});
