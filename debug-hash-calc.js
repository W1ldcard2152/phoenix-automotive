// Debug script to test hash calculation specifically
import crypto from 'crypto';
import https from 'https';

const CONFIG = {
    verificationToken: 'FukPTXCa1Ip4gkhoJ33p6iIHM4FESCkzzDqHfuaxKlUrWRKmFMlqELtGwXHB4jhc',
    endpointUrl: 'https://www.phxautogroup.com/api/partsmatrix'
};

console.log('🔍 Debug: Hash Calculation Test');
console.log('=' .repeat(40));

// Test 1: Check what the server is returning for configuration
console.log('\n1. Testing health endpoint to see server config...');

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
            const healthData = JSON.parse(data);
            console.log('✅ Health endpoint response:');
            console.log(`   Server endpoint: ${healthData.endpoint}`);
            console.log(`   Has token: ${healthData.hasVerificationToken}`);
            console.log(`   Environment: ${healthData.environment}`);
            
            // Test 2: Manual hash calculation
            console.log('\n2. Manual hash calculation test...');
            const testChallenge = 'test_challenge_12345';
            
            // Using server's endpoint URL
            const serverHashInput = testChallenge + CONFIG.verificationToken + healthData.endpoint;
            const serverHash = crypto.createHash('sha256').update(serverHashInput, 'utf8').digest('hex');
            
            // Using our expected endpoint URL
            const clientHashInput = testChallenge + CONFIG.verificationToken + CONFIG.endpointUrl;
            const clientHash = crypto.createHash('sha256').update(clientHashInput, 'utf8').digest('hex');
            
            console.log(`   Test challenge: ${testChallenge}`);
            console.log(`   Verification token: ${CONFIG.verificationToken.substring(0, 10)}...`);
            console.log('');
            console.log(`   Server endpoint: ${healthData.endpoint}`);
            console.log(`   Server hash input: ${serverHashInput}`);
            console.log(`   Server hash: ${serverHash}`);
            console.log('');
            console.log(`   Client endpoint: ${CONFIG.endpointUrl}`);
            console.log(`   Client hash input: ${clientHashInput}`);
            console.log(`   Client hash: ${clientHash}`);
            console.log('');
            
            if (serverHash === clientHash) {
                console.log('✅ Hashes match! No issue with hash calculation.');
            } else {
                console.log('❌ Hash mismatch detected!');
                console.log('🔧 Issue: Server is using different endpoint URL than expected');
                console.log(`   Expected: ${CONFIG.endpointUrl}`);
                console.log(`   Server has: ${healthData.endpoint}`);
            }
            
        } catch (error) {
            console.error('❌ Failed to parse health response:', error.message);
            console.log('Raw response:', data);
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Request failed:', error.message);
});

req.end();
