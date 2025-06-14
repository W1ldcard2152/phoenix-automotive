// eBay Compliance Testing Script
// File: test-ebay-compliance.js
// Run with: node test-ebay-compliance.js

import https from 'https';
import http from 'http';
import crypto from 'crypto';

// Configuration
const config = {
    // Change these for your environment
    local: {
        host: 'localhost',
        port: 3000,
        protocol: 'http'
    },
    production: {
        host: 'phxautogroup.com',
        port: 443,
        protocol: 'https'
    },
    // Set this to 'local' or 'production'
    environment: 'production' // Changed to production for testing
};

const currentConfig = config[config.environment];
const baseUrl = `${currentConfig.protocol}://${currentConfig.host}${currentConfig.port !== 80 && currentConfig.port !== 443 ? ':' + currentConfig.port : ''}`;

console.log(`🧪 Testing eBay Compliance Endpoint: ${baseUrl}/api/partsmatrix\n`);

// Test results tracker
const results = {
    passed: 0,
    failed: 0,
    tests: []
};

function addResult(testName, passed, message) {
    results.tests.push({ testName, passed, message });
    if (passed) {
        results.passed++;
        console.log(`✅ ${testName}: ${message}`);
    } else {
        results.failed++;
        console.log(`❌ ${testName}: ${message}`);
    }
}

// HTTP request helper
function makeRequest(options, postData = null) {
    return new Promise((resolve, reject) => {
        const client = options.protocol === 'https:' ? https : http;
        
        const req = client.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsedData = data ? JSON.parse(data) : {};
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

        req.on('error', reject);
        
        if (postData) {
            req.write(postData);
        }
        
        req.end();
    });
}

// Test 1: Health Check
async function testHealthCheck() {
    console.log('🔍 Testing health check endpoint...');
    
    try {
        const response = await makeRequest({
            hostname: currentConfig.host,
            port: currentConfig.port,
            path: '/api/partsmatrix/health',
            method: 'GET',
            protocol: currentConfig.protocol + ':'
        });

        if (response.statusCode === 200) {
            addResult('Health Check', true, 'Endpoint is accessible');
            if (response.data && response.data.status === 'OK') {
                addResult('Health Status', true, 'Service reports healthy status');
                console.log(`   📊 Endpoint URL: ${response.data.endpoint}`);
                console.log(`   🔑 Has Token: ${response.data.hasVerificationToken}`);
            } else {
                addResult('Health Status', false, 'Service reports unhealthy status');
            }
        } else {
            addResult('Health Check', false, `HTTP ${response.statusCode}: ${response.rawData}`);
        }
    } catch (error) {
        addResult('Health Check', false, `Connection error: ${error.message}`);
    }
}

// Test 2: Challenge Code Verification
async function testChallengeCode() {
    console.log('\n🔍 Testing challenge code verification...');
    
    const testChallengeCode = 'test_challenge_' + Date.now();
    
    try {
        const response = await makeRequest({
            hostname: currentConfig.host,
            port: currentConfig.port,
            path: `/api/partsmatrix?challenge_code=${testChallengeCode}`,
            method: 'GET',
            protocol: currentConfig.protocol + ':',
            headers: {
                'User-Agent': 'eBayNotificationTest/1.0',
                'Accept': 'application/json'
            }
        });

        console.log(`   📡 Request: ${currentConfig.protocol}://${currentConfig.host}/api/partsmatrix?challenge_code=${testChallengeCode}`);
        
        if (response.statusCode === 200) {
            if (response.data && response.data.challengeResponse) {
                addResult('Challenge Response', true, 'Returned valid challenge response');
                console.log(`   🔐 Challenge Code: ${testChallengeCode}`);
                console.log(`   🔑 Response Hash: ${response.data.challengeResponse.substring(0, 16)}...`);
                console.log(`   📝 Full Response:`, response.data);
                
                // Verify the hash is 64 characters (SHA256 hex)
                if (response.data.challengeResponse.length === 64) {
                    addResult('Hash Format', true, 'SHA256 hash format is correct');
                } else {
                    addResult('Hash Format', false, `Hash length is ${response.data.challengeResponse.length}, expected 64`);
                }
            } else {
                addResult('Challenge Response', false, 'Missing challengeResponse in response');
                console.log(`   ❌ Response body:`, response.rawData);
            }
        } else {
            addResult('Challenge Response', false, `HTTP ${response.statusCode}: ${response.rawData}`);
            console.log(`   ❌ Full response headers:`, response.headers);
        }
    } catch (error) {
        addResult('Challenge Response', false, `Connection error: ${error.message}`);
        console.log(`   ❌ Error details:`, error);
    }
}

// Test 3: Missing Challenge Code
async function testMissingChallengeCode() {
    console.log('\n🔍 Testing missing challenge code (should fail)...');
    
    try {
        const response = await makeRequest({
            hostname: currentConfig.host,
            port: currentConfig.port,
            path: '/api/partsmatrix',
            method: 'GET',
            protocol: currentConfig.protocol + ':'
        });

        if (response.statusCode === 400) {
            addResult('Missing Challenge Code', true, 'Correctly rejected request without challenge code');
        } else {
            addResult('Missing Challenge Code', false, `Expected HTTP 400, got ${response.statusCode}`);
        }
    } catch (error) {
        addResult('Missing Challenge Code', false, `Connection error: ${error.message}`);
    }
}

// Test 4: Invalid POST Request
async function testInvalidPost() {
    console.log('\n🔍 Testing invalid POST request (should fail)...');
    
    const invalidPayload = JSON.stringify({ invalid: 'payload' });
    
    try {
        const response = await makeRequest({
            hostname: currentConfig.host,
            port: currentConfig.port,
            path: '/api/partsmatrix',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(invalidPayload)
            },
            protocol: currentConfig.protocol + ':'
        }, invalidPayload);

        if (response.statusCode === 400) {
            addResult('Invalid POST Payload', true, 'Correctly rejected invalid payload');
        } else {
            addResult('Invalid POST Payload', false, `Expected HTTP 400, got ${response.statusCode}`);
        }
    } catch (error) {
        addResult('Invalid POST Payload', false, `Connection error: ${error.message}`);
    }
}

// Test 5: Valid Deletion Notification (Mock)
async function testValidDeletionNotification() {
    console.log('\n🔍 Testing valid deletion notification...');
    
    const validPayload = JSON.stringify({
        metadata: {
            topic: "MARKETPLACE_ACCOUNT_DELETION",
            schemaVersion: "1.0",
            deprecated: false
        },
        notification: {
            notificationId: `test_notification_${Date.now()}`,
            eventDate: new Date().toISOString(),
            publishDate: new Date().toISOString(),
            publishAttemptCount: 1,
            data: {
                username: "test_user_" + Date.now(),
                userId: "test_user_id_" + Math.random().toString(36).substring(7),
                eiasToken: "test_eias_token_" + Math.random().toString(36).substring(7)
            }
        }
    });
    
    try {
        const response = await makeRequest({
            hostname: currentConfig.host,
            port: currentConfig.port,
            path: '/api/partsmatrix',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(validPayload)
            },
            protocol: currentConfig.protocol + ':'
        }, validPayload);

        if (response.statusCode === 200) {
            addResult('Valid Deletion Notification', true, 'Successfully processed deletion notification');
        } else {
            addResult('Valid Deletion Notification', false, `Expected HTTP 200, got ${response.statusCode}: ${response.rawData}`);
        }
    } catch (error) {
        addResult('Valid Deletion Notification', false, `Connection error: ${error.message}`);
    }
}

// Test 6: Duplicate Notification
async function testDuplicateNotification() {
    console.log('\n🔍 Testing duplicate notification handling...');
    
    const notificationId = `duplicate_test_${Date.now()}`;
    const validPayload = JSON.stringify({
        metadata: {
            topic: "MARKETPLACE_ACCOUNT_DELETION",
            schemaVersion: "1.0",
            deprecated: false
        },
        notification: {
            notificationId: notificationId,
            eventDate: new Date().toISOString(),
            publishDate: new Date().toISOString(),
            publishAttemptCount: 1,
            data: {
                username: "duplicate_test_user",
                userId: "duplicate_test_id",
                eiasToken: "duplicate_test_token"
            }
        }
    });
    
    try {
        // Send first notification
        const response1 = await makeRequest({
            hostname: currentConfig.host,
            port: currentConfig.port,
            path: '/api/partsmatrix',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(validPayload)
            },
            protocol: currentConfig.protocol + ':'
        }, validPayload);

        // Send duplicate notification
        const response2 = await makeRequest({
            hostname: currentConfig.host,
            port: currentConfig.port,
            path: '/api/partsmatrix',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(validPayload)
            },
            protocol: currentConfig.protocol + ':'
        }, validPayload);

        if (response1.statusCode === 200 && response2.statusCode === 200) {
            addResult('Duplicate Notification', true, 'Both original and duplicate returned 200 (correct behavior)');
        } else {
            addResult('Duplicate Notification', false, `First: ${response1.statusCode}, Duplicate: ${response2.statusCode}`);
        }
    } catch (error) {
        addResult('Duplicate Notification', false, `Connection error: ${error.message}`);
    }
}

// Run all tests
async function runAllTests() {
    console.log('🚀 Starting eBay Compliance Test Suite\n');
    console.log('=' * 50);
    
    await testHealthCheck();
    await testChallengeCode();
    await testMissingChallengeCode();
    await testInvalidPost();
    await testValidDeletionNotification();
    await testDuplicateNotification();
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`📈 Success Rate: ${Math.round((results.passed / (results.passed + results.failed)) * 100)}%`);
    
    if (results.failed === 0) {
        console.log('\n🎉 All tests passed! Your eBay compliance endpoint is ready.');
        console.log('\n📋 Next steps:');
        console.log('1. Deploy to production if testing locally');
        console.log('2. Configure eBay Developer Portal with your endpoint');
        console.log('3. Test the subscription verification in eBay portal');
    } else {
        console.log('\n⚠️  Some tests failed. Please review the errors above.');
        console.log('\n🔧 Common fixes:');
        console.log('- Ensure the server is running');
        console.log('- Check environment variables are set');
        console.log('- Verify the endpoint URL is correct');
        console.log('- Check firewall/network accessibility');
    }
    
    console.log('\n📝 Detailed Results:');
    results.tests.forEach(test => {
        console.log(`   ${test.passed ? '✅' : '❌'} ${test.testName}: ${test.message}`);
    });
}

// Handle command line arguments
if (process.argv.includes('--production')) {
    config.environment = 'production';
    console.log('🌐 Testing PRODUCTION environment');
} else if (process.argv.includes('--local')) {
    config.environment = 'local';
    console.log('💻 Testing LOCAL environment');
} else {
    console.log(`🔧 Testing ${config.environment.toUpperCase()} environment (default)`);
}

// Run the tests
runAllTests().catch(error => {
    console.error('💥 Test suite failed:', error);
    process.exit(1);
});