// Comprehensive eBay Endpoint Test Suite
// This script performs all necessary tests to verify eBay compliance

import https from 'https';
import crypto from 'crypto';

// Configuration from your .env file
const CONFIG = {
    host: 'www.phxautogroup.com',
    port: 443,
    protocol: 'https',
    verificationToken: 'FukPTXCa1Ip4gkhoJ33p6iIHM4FESCkzzDqHfuaxKlUrWRKmFMlqELtGwXHB4jhc',
    endpointUrl: 'https://www.phxautogroup.com/api/partsmatrix'
};

console.log('🚀 eBay Marketplace Account Deletion Compliance Test Suite');
console.log('='.repeat(65));
console.log(`Testing endpoint: ${CONFIG.endpointUrl}`);
console.log(`Verification token: ${CONFIG.verificationToken.substring(0, 15)}...`);
console.log('='.repeat(65));

// Helper function for HTTP requests
function makeRequest(options, postData = null) {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsedData = data.trim() ? JSON.parse(data) : null;
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        data: parsedData,
                        rawData: data,
                        timing: Date.now() - startTime
                    });
                } catch (e) {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        data: null,
                        rawData: data,
                        timing: Date.now() - startTime
                    });
                }
            });
        });

        req.on('error', reject);
        
        const startTime = Date.now();
        
        if (postData) {
            req.write(postData);
        }
        
        req.end();
    });
}

// Test results
const results = [];

function addResult(testName, passed, message, details = null) {
    results.push({ testName, passed, message, details });
    const status = passed ? '✅' : '❌';
    console.log(`${status} ${testName}: ${message}`);
    if (details) {
        console.log(`   Details: ${JSON.stringify(details, null, 2)}`);
    }
}

// Test 1: SSL Certificate Chain Validation
async function testSSLCertificate() {
    console.log('\n1. 🔒 Testing SSL Certificate Chain...');
    
    try {
        const options = {
            hostname: CONFIG.host,
            port: CONFIG.port,
            path: '/api/partsmatrix/health',
            method: 'GET',
            rejectUnauthorized: true, // This will fail if SSL chain is invalid
            headers: {
                'User-Agent': 'eBayEndpointTester/1.0'
            }
        };

        const response = await makeRequest(options);
        
        if (response.statusCode === 200) {
            addResult('SSL Certificate', true, 'Certificate chain is valid and trusted');
        } else {
            addResult('SSL Certificate', false, `HTTP ${response.statusCode} - ${response.rawData}`);
        }
    } catch (error) {
        if (error.code === 'CERT_UNTRUSTED' || error.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE') {
            addResult('SSL Certificate', false, 'Certificate chain validation failed - missing intermediate certificates', {
                error: error.code,
                message: error.message
            });
        } else {
            addResult('SSL Certificate', false, `SSL connection failed: ${error.message}`);
        }
    }
}

// Test 2: Challenge Code Verification
async function testChallengeVerification() {
    console.log('\n2. 🔐 Testing Challenge Code Verification...');
    
    const challengeCode = 'test_challenge_' + Date.now();
    
    try {
        const options = {
            hostname: CONFIG.host,
            port: CONFIG.port,
            path: `/api/partsmatrix?challenge_code=${challengeCode}`,
            method: 'GET',
            headers: {
                'User-Agent': 'eBayNotificationService/1.0',
                'Accept': 'application/json',
                'Connection': 'close'
            }
        };

        const response = await makeRequest(options);
        
        console.log(`   Request: ${CONFIG.protocol}://${CONFIG.host}/api/partsmatrix?challenge_code=${challengeCode}`);
        console.log(`   Response time: ${response.timing}ms`);
        
        if (response.statusCode === 200) {
            if (response.data && response.data.challengeResponse) {
                // Verify the hash is correct
                const expectedHash = crypto.createHash('sha256')
                    .update(challengeCode + CONFIG.verificationToken + CONFIG.endpointUrl, 'utf8')
                    .digest('hex');
                
                const receivedHash = response.data.challengeResponse;
                
                if (expectedHash === receivedHash) {
                    addResult('Challenge Verification', true, 'Challenge code verification successful');
                    console.log(`   Challenge: ${challengeCode}`);
                    console.log(`   Expected:  ${expectedHash}`);
                    console.log(`   Received:  ${receivedHash}`);
                } else {
                    addResult('Challenge Verification', false, 'Hash mismatch - server may need restart to load new .env', {
                        expected: expectedHash,
                        received: receivedHash,
                        challenge: challengeCode,
                        note: 'Check if server restarted after .env changes'
                    });
                    console.log(`   ⚠️  Hash Debug Info:`);
                    console.log(`   Challenge: ${challengeCode}`);
                    console.log(`   Token: ${CONFIG.verificationToken.substring(0, 15)}...`);
                    console.log(`   Expected URL: ${CONFIG.endpointUrl}`);
                    console.log(`   Expected Hash: ${expectedHash}`);
                    console.log(`   Received Hash: ${receivedHash}`);
                    console.log(`   💡 If hashes don't match, server may still have old endpoint URL`);
                }
            } else {
                addResult('Challenge Verification', false, 'Missing challengeResponse in response', response.data);
            }
        } else {
            addResult('Challenge Verification', false, `HTTP ${response.statusCode}: ${response.rawData}`);
        }
    } catch (error) {
        addResult('Challenge Verification', false, `Request failed: ${error.message}`);
    }
}

// Test 3: Health Check Endpoint
async function testHealthCheck() {
    console.log('\n3. 🏥 Testing Health Check Endpoint...');
    
    try {
        const options = {
            hostname: CONFIG.host,
            port: CONFIG.port,
            path: '/api/partsmatrix/health',
            method: 'GET',
            headers: {
                'User-Agent': 'eBayEndpointTester/1.0',
                'Accept': 'application/json'
            }
        };

        const response = await makeRequest(options);
        
        if (response.statusCode === 200 && response.data) {
            addResult('Health Check', true, 'Health endpoint responding correctly');
            console.log(`   Status: ${response.data.status}`);
            console.log(`   Has Token: ${response.data.hasVerificationToken}`);
            console.log(`   Endpoint: ${response.data.endpoint}`);
        } else {
            addResult('Health Check', false, `HTTP ${response.statusCode}: ${response.rawData}`);
        }
    } catch (error) {
        addResult('Health Check', false, `Health check failed: ${error.message}`);
    }
}

// Test 4: Error Handling
async function testErrorHandling() {
    console.log('\n4. ⚠️ Testing Error Handling...');
    
    // Test missing challenge code
    try {
        const options = {
            hostname: CONFIG.host,
            port: CONFIG.port,
            path: '/api/partsmatrix',
            method: 'GET',
            headers: {
                'User-Agent': 'eBayNotificationService/1.0'
            }
        };

        const response = await makeRequest(options);
        
        if (response.statusCode === 400) {
            addResult('Error Handling', true, 'Correctly rejects missing challenge code');
        } else {
            addResult('Error Handling', false, `Expected 400, got ${response.statusCode}`);
        }
    } catch (error) {
        addResult('Error Handling', false, `Error handling test failed: ${error.message}`);
    }
}

// Test 5: POST Request Handling
async function testPostRequest() {
    console.log('\n5. 📬 Testing POST Request Handling...');
    
    const testPayload = {
        metadata: {
            topic: "MARKETPLACE_ACCOUNT_DELETION",
            schemaVersion: "1.0",
            deprecated: false
        },
        notification: {
            notificationId: `compliance_test_${Date.now()}`,
            eventDate: new Date().toISOString(),
            publishDate: new Date().toISOString(),
            publishAttemptCount: 1,
            data: {
                username: "compliance_test_user",
                userId: "compliance_test_id",
                eiasToken: "compliance_test_token"
            }
        }
    };
    
    const payload = JSON.stringify(testPayload);
    
    try {
        const options = {
            hostname: CONFIG.host,
            port: CONFIG.port,
            path: '/api/partsmatrix',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload),
                'User-Agent': 'eBayNotificationService/1.0',
                'Accept': 'application/json'
            }
        };

        const response = await makeRequest(options, payload);
        
        if (response.statusCode === 200) {
            addResult('POST Request', true, 'Successfully processed deletion notification');
        } else {
            addResult('POST Request', false, `HTTP ${response.statusCode}: ${response.rawData}`);
        }
    } catch (error) {
        addResult('POST Request', false, `POST request failed: ${error.message}`);
    }
}

// Test 6: Headers Compatibility
async function testHeadersCompatibility() {
    console.log('\n6. 📋 Testing Headers Compatibility...');
    
    const challengeCode = 'header_test_' + Date.now();
    
    try {
        const options = {
            hostname: CONFIG.host,
            port: CONFIG.port,
            path: `/api/partsmatrix?challenge_code=${challengeCode}`,
            method: 'GET',
            headers: {
                'User-Agent': 'eBayNotificationService/1.0',
                'Accept': 'application/json',
                'Accept-Charset': 'utf-8',
                'Cache-Control': 'no-cache'
            }
        };

        const response = await makeRequest(options);
        
        const contentType = response.headers['content-type'];
        const cacheControl = response.headers['cache-control'];
        
        let headerIssues = [];
        
        if (!contentType || !contentType.includes('application/json')) {
            headerIssues.push('Missing or incorrect Content-Type header');
        }
        
        if (!cacheControl || !cacheControl.includes('no-cache')) {
            headerIssues.push('Missing or incorrect Cache-Control header');
        }
        
        if (headerIssues.length === 0) {
            addResult('Headers Compatibility', true, 'All response headers are eBay-compatible');
        } else {
            addResult('Headers Compatibility', false, 'Header compatibility issues found', headerIssues);
        }
        
        console.log(`   Content-Type: ${contentType}`);
        console.log(`   Cache-Control: ${cacheControl}`);
        
    } catch (error) {
        addResult('Headers Compatibility', false, `Headers test failed: ${error.message}`);
    }
}

// Main test runner
async function runAllTests() {
    console.log(`\n⏰ Test started at: ${new Date().toISOString()}\n`);
    
    await testSSLCertificate();
    await testHealthCheck();
    await testChallengeVerification();
    await testErrorHandling();
    await testPostRequest();
    await testHeadersCompatibility();
    
    // Generate summary
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    const total = results.length;
    
    console.log('\n' + '='.repeat(65));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(65));
    console.log(`✅ Passed: ${passed}/${total}`);
    console.log(`❌ Failed: ${failed}/${total}`);
    console.log(`📈 Success Rate: ${Math.round((passed / total) * 100)}%`);
    
    if (failed === 0) {
        console.log('\n🎉 ALL TESTS PASSED!');
        console.log('Your eBay endpoint is ready for production use.');
        console.log('\n📋 Next Steps:');
        console.log('1. ✅ Your endpoint is properly configured');
        console.log('2. ✅ SSL certificate chain is valid');
        console.log('3. ✅ Challenge verification is working');
        console.log('4. ✅ POST requests are handled correctly');
        console.log('5. 🔗 Configure in eBay Developer Portal');
        console.log('6. 🧪 Test with eBay\'s validation tool');
    } else {
        console.log('\n⚠️ ISSUES FOUND - Please fix the following:');
        
        results.filter(r => !r.passed).forEach(result => {
            console.log(`\n❌ ${result.testName}:`);
            console.log(`   Issue: ${result.message}`);
            if (result.details) {
                console.log(`   Details: ${JSON.stringify(result.details, null, 4)}`);
            }
        });
        
        console.log('\n🔧 Common Solutions:');
        console.log('1. SSL Issues: Contact hosting provider about certificate chain');
        console.log('2. 404 Errors: Verify endpoint URL routing is correct');
        console.log('3. 500 Errors: Check server logs for detailed error messages');
        console.log('4. Hash Issues: Verify verification token is correct');
        console.log('5. Hash Mismatch: Restart server to load new .env file');
        console.log('6. Cache Issues: Clear browser/CDN cache if applicable');
    }
    
    console.log('\n🔗 Manual Test Commands:');
    console.log(`curl -v "${CONFIG.endpointUrl}?challenge_code=manual_test"`);
    console.log(`curl -v "${CONFIG.endpointUrl}/health"`);
    
    console.log('\n📊 SSL Certificate Test:');
    console.log('https://www.ssllabs.com/ssltest/analyze.html?d=www.phxautogroup.com');
    
    console.log('\n⏰ Test completed at:', new Date().toISOString());
}

// Run the tests
runAllTests().catch(error => {
    console.error('💥 Test suite failed:', error);
    process.exit(1);
});
