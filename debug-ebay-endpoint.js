// eBay Endpoint Debug Script
// This script helps debug the specific issue with eBay's endpoint validation

import https from 'https';
import http from 'http';
import crypto from 'crypto';

// Configuration
const config = {
    host: 'phxautogroup.com',
    port: 443,
    protocol: 'https',
    verificationToken: 'FukPTXCa1Ip4gkhoJ33p6iIHM4FESCkzzDqHfuaxKlUrWRKmFMlqELtGwXHB4jhc',
    endpointUrl: 'https://phxautogroup.com/api/partsmatrix'
};

console.log('🔍 eBay Endpoint Debug Script');
console.log('='.repeat(50));
console.log(`Target: ${config.protocol}://${config.host}/api/partsmatrix`);
console.log(`Verification Token: ${config.verificationToken.substring(0, 10)}...`);
console.log(`Endpoint URL: ${config.endpointUrl}`);
console.log('='.repeat(50));

function makeRequest(options, postData = null) {
    return new Promise((resolve, reject) => {
        const client = options.protocol === 'https:' ? https : http;
        
        const req = client.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsedData = data ? JSON.parse(data) : null;
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        data: parsedData,
                        rawData: data
                    });
                } catch (e) {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        data: null,
                        rawData: data
                    });
                }
            });
        });

        req.on('error', (error) => {
            reject({
                error: error.message,
                code: error.code,
                syscall: error.syscall,
                address: error.address,
                port: error.port
            });
        });
        
        if (postData) {
            req.write(postData);
        }
        
        req.end();
    });
}

// Test 1: Basic connectivity
async function testConnectivity() {
    console.log('\n1. 🌐 Testing basic connectivity...');
    
    try {
        const response = await makeRequest({
            hostname: config.host,
            port: config.port,
            path: '/api/health',
            method: 'GET',
            protocol: config.protocol + ':',
            headers: {
                'User-Agent': 'eBayDebugScript/1.0'
            }
        });

        console.log(`   Status: ${response.statusCode}`);
        console.log(`   Headers:`, JSON.stringify(response.headers, null, 2));
        console.log(`   Body:`, response.rawData);
        
        if (response.statusCode === 200) {
            console.log('   ✅ Server is accessible');
        } else {
            console.log('   ❌ Server returned error status');
        }
    } catch (error) {
        console.log('   ❌ Connection failed:', error);
    }
}

// Test 2: eBay endpoint health check
async function testEbayEndpointHealth() {
    console.log('\n2. 🏥 Testing eBay endpoint health...');
    
    try {
        const response = await makeRequest({
            hostname: config.host,
            port: config.port,
            path: '/api/partsmatrix/health',
            method: 'GET',
            protocol: config.protocol + ':',
            headers: {
                'User-Agent': 'eBayNotificationService/1.0'
            }
        });

        console.log(`   Status: ${response.statusCode}`);
        console.log(`   Response:`, response.rawData);
        
        if (response.statusCode === 200 && response.data) {
            console.log('   ✅ eBay endpoint health check passed');
            console.log(`   Token present: ${response.data.hasVerificationToken}`);
            console.log(`   Endpoint URL: ${response.data.endpoint}`);
        } else {
            console.log('   ❌ eBay endpoint health check failed');
        }
    } catch (error) {
        console.log('   ❌ Health check failed:', error);
    }
}

// Test 3: Challenge code verification (simulating eBay's test)
async function testChallengeVerification() {
    console.log('\n3. 🔐 Testing challenge code verification...');
    
    // Use a challenge code similar to what eBay might send
    const challengeCode = 'ebay_test_' + Date.now();
    
    try {
        const response = await makeRequest({
            hostname: config.host,
            port: config.port,
            path: `/api/partsmatrix?challenge_code=${challengeCode}`,
            method: 'GET',
            protocol: config.protocol + ':',
            headers: {
                'User-Agent': 'eBayNotificationService/1.0',
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        console.log(`   Request URL: ${config.protocol}://${config.host}/api/partsmatrix?challenge_code=${challengeCode}`);
        console.log(`   Status: ${response.statusCode}`);
        console.log(`   Headers:`, JSON.stringify(response.headers, null, 2));
        console.log(`   Body:`, response.rawData);
        
        if (response.statusCode === 200 && response.data && response.data.challengeResponse) {
            console.log('   ✅ Challenge verification successful');
            console.log(`   Challenge Code: ${challengeCode}`);
            console.log(`   Challenge Response: ${response.data.challengeResponse}`);
            
            // Verify the hash manually
            const expectedHash = crypto.createHash('sha256')
                .update(challengeCode + config.verificationToken + config.endpointUrl, 'utf8')
                .digest('hex');
            
            console.log(`   Expected Hash: ${expectedHash}`);
            console.log(`   Received Hash: ${response.data.challengeResponse}`);
            console.log(`   Hash Match: ${expectedHash === response.data.challengeResponse ? '✅' : '❌'}`);
            
        } else {
            console.log('   ❌ Challenge verification failed');
        }
    } catch (error) {
        console.log('   ❌ Challenge verification error:', error);
    }
}

// Test 4: Test marketplace deletion notification
async function testMarketplaceDeletion() {
    console.log('\n4. 📬 Testing marketplace deletion notification...');
    
    const testPayload = {
        metadata: {
            topic: "MARKETPLACE_ACCOUNT_DELETION",
            schemaVersion: "1.0",
            deprecated: false
        },
        notification: {
            notificationId: `debug_test_${Date.now()}`,
            eventDate: new Date().toISOString(),
            publishDate: new Date().toISOString(),
            publishAttemptCount: 1,
            data: {
                username: "debug_test_user",
                userId: "debug_test_user_id",
                eiasToken: "debug_test_eias_token"
            }
        }
    };
    
    const payload = JSON.stringify(testPayload);
    
    try {
        const response = await makeRequest({
            hostname: config.host,
            port: config.port,
            path: '/api/partsmatrix',
            method: 'POST',
            protocol: config.protocol + ':',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload),
                'User-Agent': 'eBayNotificationService/1.0'
            }
        }, payload);

        console.log(`   Status: ${response.statusCode}`);
        console.log(`   Headers:`, JSON.stringify(response.headers, null, 2));
        console.log(`   Body:`, response.rawData);
        
        if (response.statusCode === 200) {
            console.log('   ✅ Marketplace deletion notification processed successfully');
        } else {
            console.log('   ❌ Marketplace deletion notification failed');
        }
    } catch (error) {
        console.log('   ❌ Marketplace deletion notification error:', error);
    }
}

// Test 5: Check SSL/TLS configuration
async function testSSLConfiguration() {
    console.log('\n5. 🔒 Testing SSL/TLS configuration...');
    
    try {
        const response = await makeRequest({
            hostname: config.host,
            port: config.port,
            path: '/api/partsmatrix/health',
            method: 'GET',
            protocol: config.protocol + ':',
            headers: {
                'User-Agent': 'eBayNotificationService/1.0'
            },
            // Add SSL-specific options
            rejectUnauthorized: true,
            secureProtocol: 'TLSv1_2_method'
        });

        console.log(`   Status: ${response.statusCode}`);
        console.log(`   TLS Version: ${response.headers['x-tls-version'] || 'Not specified'}`);
        console.log(`   Server: ${response.headers.server || 'Not specified'}`);
        
        if (response.statusCode === 200) {
            console.log('   ✅ SSL/TLS configuration appears correct');
        } else {
            console.log('   ❌ SSL/TLS configuration may have issues');
        }
    } catch (error) {
        console.log('   ❌ SSL/TLS test failed:', error);
    }
}

// Test 6: Check for common eBay validation issues
async function testEbayValidationIssues() {
    console.log('\n6. 🔍 Testing for common eBay validation issues...');
    
    // Test with empty challenge code
    console.log('   Testing empty challenge code...');
    try {
        const response = await makeRequest({
            hostname: config.host,
            port: config.port,
            path: '/api/partsmatrix?challenge_code=',
            method: 'GET',
            protocol: config.protocol + ':',
            headers: {
                'User-Agent': 'eBayNotificationService/1.0'
            }
        });
        
        if (response.statusCode === 400) {
            console.log('   ✅ Empty challenge code properly rejected (400)');
        } else {
            console.log(`   ❌ Empty challenge code returned ${response.statusCode} instead of 400`);
        }
    } catch (error) {
        console.log('   ❌ Empty challenge code test failed:', error.message);
    }
    
    // Test with no query parameters
    console.log('   Testing no query parameters...');
    try {
        const response = await makeRequest({
            hostname: config.host,
            port: config.port,
            path: '/api/partsmatrix',
            method: 'GET',
            protocol: config.protocol + ':',
            headers: {
                'User-Agent': 'eBayNotificationService/1.0'
            }
        });
        
        if (response.statusCode === 400) {
            console.log('   ✅ Missing challenge code properly rejected (400)');
        } else {
            console.log(`   ❌ Missing challenge code returned ${response.statusCode} instead of 400`);
        }
    } catch (error) {
        console.log('   ❌ Missing challenge code test failed:', error.message);
    }
}

// Main execution
async function runDebugTests() {
    console.log('\n🚀 Starting eBay Endpoint Debug Tests');
    console.log('Time:', new Date().toISOString());
    
    await testConnectivity();
    await testEbayEndpointHealth();
    await testChallengeVerification();
    await testMarketplaceDeletion();
    await testSSLConfiguration();
    await testEbayValidationIssues();
    
    console.log('\n' + '='.repeat(60));
    console.log('🏁 Debug tests completed');
    console.log('='.repeat(60));
    
    console.log('\n📋 Next Steps for eBay Configuration:');
    console.log('1. Ensure your endpoint URL in eBay is: https://phxautogroup.com/api/partsmatrix');
    console.log('2. Your verification token should be: FukPTXCa1Ip4gkhoJ33p6iIHM4FESCkzzDqHfuaxKlUrWRKmFMlqELtGwXHB4jhc');
    console.log('3. Make sure eBay is testing with HTTPS (not HTTP)');
    console.log('4. Check that your server is accessible from eBay\'s servers');
    console.log('5. Verify no firewall or security rules are blocking eBay\'s requests');
    
    console.log('\n🔧 If issues persist:');
    console.log('- Check server logs during eBay\'s validation attempt');
    console.log('- Ensure the endpoint returns exactly what eBay expects');
    console.log('- Test with curl: curl "https://phxautogroup.com/api/partsmatrix?challenge_code=test123"');
}

// Run the debug tests
runDebugTests().catch(error => {
    console.error('💥 Debug script failed:', error);
    process.exit(1);
});
