#!/usr/bin/env node

/**
 * eBay 401 Error Fix Test Script
 * Tests the specific issue: Notification delivery failed with HTTP status code 401
 * 
 * Usage:
 *   node test-ebay-401-fix.js --local     # Test localhost:3000
 *   node test-ebay-401-fix.js --prod      # Test production
 */

import https from 'https';
import http from 'http';

// Configuration
const configs = {
    local: {
        protocol: 'http',
        host: 'localhost',
        port: 3000,
        name: 'Local Development'
    },
    production: {
        protocol: 'https',
        host: 'www.phxautogroup.com',
        port: 443,
        name: 'Production'
    }
};

// Parse command line arguments
const args = process.argv.slice(2);
const configKey = args.includes('--prod') || args.includes('--production') ? 'production' : 'local';
const currentConfig = configs[configKey];

console.log(`🧪 Testing eBay 401 Fix against ${currentConfig.name}`);
console.log(`📍 Target: ${currentConfig.protocol}://${currentConfig.host}:${currentConfig.port}/api/partsmatrix`);
console.log('=' * 80);

// Test results tracking
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
function makeRequest(options, data = null) {
    return new Promise((resolve, reject) => {
        const lib = options.protocol === 'https:' ? https : http;
        
        const req = lib.request(options, (res) => {
            let rawData = '';
            res.on('data', (chunk) => {
                rawData += chunk;
            });
            
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    rawData: rawData,
                    data: rawData ? (() => {
                        try {
                            return JSON.parse(rawData);
                        } catch {
                            return rawData;
                        }
                    })() : null
                });
            });
        });

        req.on('error', (err) => {
            reject(err);
        });

        if (data) {
            req.write(data);
        }
        
        req.end();
    });
}

// Test 1: Health Check
async function testHealthCheck() {
    console.log('\n🔍 Testing health check endpoint...');
    
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
        } else {
            addResult('Health Check', false, `Expected HTTP 200, got ${response.statusCode}`);
        }
    } catch (error) {
        addResult('Health Check', false, `Connection error: ${error.message}`);
    }
}

// Test 2: Challenge Code Verification (simulating eBay's request)
async function testChallengeCode() {
    console.log('\n🔍 Testing eBay challenge code verification...');
    
    const challengeCode = 'test_challenge_' + Date.now();
    
    try {
        const response = await makeRequest({
            hostname: currentConfig.host,
            port: currentConfig.port,
            path: `/api/partsmatrix?challenge_code=${challengeCode}`,
            method: 'GET',
            headers: {
                'User-Agent': 'eBay-Notification-Service/1.0',
                'Accept': 'application/json',
                'Connection': 'close'
            },
            protocol: currentConfig.protocol + ':'
        });

        if (response.statusCode === 200 && response.data && response.data.challengeResponse) {
            addResult('Challenge Code Verification', true, 'eBay challenge handled correctly');
        } else if (response.statusCode === 401) {
            addResult('Challenge Code Verification', false, '❌ 401 UNAUTHORIZED - This is the bug we need to fix!');
        } else {
            addResult('Challenge Code Verification', false, `Expected HTTP 200 with challengeResponse, got ${response.statusCode}: ${JSON.stringify(response.data)}`);
        }
    } catch (error) {
        addResult('Challenge Code Verification', false, `Connection error: ${error.message}`);
    }
}

// Test 3: Simulated eBay Notification (the main test)
async function testEbayNotification() {
    console.log('\n🔍 Testing eBay marketplace deletion notification (main test)...');
    
    const payload = JSON.stringify({
        metadata: {
            topic: "MARKETPLACE_ACCOUNT_DELETION",
            schemaVersion: "1.0",
            deprecated: false
        },
        notification: {
            notificationId: `test_fix_${Date.now()}`,
            eventDate: new Date().toISOString(),
            publishDate: new Date().toISOString(),
            publishAttemptCount: 1,
            data: {
                username: "test_401_fix_user",
                userId: "test_401_fix_user_id",
                eiasToken: "test_401_fix_eias_token"
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
                'Content-Length': Buffer.byteLength(payload),
                'User-Agent': 'eBay-Notification-Service/1.0',
                'Accept': 'application/json',
                'Connection': 'close'
                // Intentionally NOT including Authorization header (eBay doesn't send one)
            },
            protocol: currentConfig.protocol + ':'
        }, payload);

        if (response.statusCode === 200) {
            addResult('eBay Notification (401 Fix)', true, '🎉 SUCCESS! No more 401 errors - notification accepted');
        } else if (response.statusCode === 401) {
            addResult('eBay Notification (401 Fix)', false, '❌ STILL GETTING 401 - Fix not working yet');
        } else {
            addResult('eBay Notification (401 Fix)', false, `Unexpected status: ${response.statusCode} - ${JSON.stringify(response.data)}`);
        }
    } catch (error) {
        addResult('eBay Notification (401 Fix)', false, `Connection error: ${error.message}`);
    }
}

// Test 4: Test with Authentication Header (should still work)
async function testWithAuthHeader() {
    console.log('\n🔍 Testing that endpoint still works even if auth header is present...');
    
    const payload = JSON.stringify({
        metadata: {
            topic: "MARKETPLACE_ACCOUNT_DELETION",
            schemaVersion: "1.0",
            deprecated: false
        },
        notification: {
            notificationId: `test_auth_${Date.now()}`,
            eventDate: new Date().toISOString(),
            publishDate: new Date().toISOString(),
            publishAttemptCount: 1,
            data: {
                username: "test_auth_user",
                userId: "test_auth_user_id",
                eiasToken: "test_auth_eias_token"
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
                'Content-Length': Buffer.byteLength(payload),
                'Authorization': 'Bearer fake_token_should_be_ignored',
                'User-Agent': 'Test-Agent/1.0'
            },
            protocol: currentConfig.protocol + ':'
        }, payload);

        if (response.statusCode === 200) {
            addResult('With Auth Header', true, 'Endpoint properly ignores auth headers');
        } else {
            addResult('With Auth Header', false, `Expected HTTP 200, got ${response.statusCode}`);
        }
    } catch (error) {
        addResult('With Auth Header', false, `Connection error: ${error.message}`);
    }
}

// Test 5: OPTIONS preflight test
async function testOptionsRequest() {
    console.log('\n🔍 Testing OPTIONS preflight request...');
    
    try {
        const response = await makeRequest({
            hostname: currentConfig.host,
            port: currentConfig.port,
            path: '/api/partsmatrix',
            method: 'OPTIONS',
            headers: {
                'Origin': 'https://developer.ebay.com',
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type, X-EBAY-SIGNATURE'
            },
            protocol: currentConfig.protocol + ':'
        });

        if (response.statusCode === 204 || response.statusCode === 200) {
            addResult('OPTIONS Preflight', true, 'CORS preflight handled correctly');
        } else {
            addResult('OPTIONS Preflight', false, `Expected HTTP 204/200, got ${response.statusCode}`);
        }
    } catch (error) {
        addResult('OPTIONS Preflight', false, `Connection error: ${error.message}`);
    }
}

// Run all tests
async function runAllTests() {
    console.log('\n🚀 Starting eBay 401 Fix Verification Tests\n');
    
    await testHealthCheck();
    await testChallengeCode();
    await testEbayNotification();  // The main test
    await testWithAuthHeader();
    await testOptionsRequest();
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('='.repeat(80));
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`📈 Success Rate: ${results.passed + results.failed > 0 ? Math.round((results.passed / (results.passed + results.failed)) * 100) : 0}%`);
    
    // Focus on the main 401 fix
    const mainTest = results.tests.find(t => t.testName === 'eBay Notification (401 Fix)');
    if (mainTest && mainTest.passed) {
        console.log('\n🎉 SUCCESS! The 401 error has been fixed!');
        console.log('✅ eBay notifications should now work properly');
        console.log('\n📋 Next steps:');
        console.log('1. Deploy these changes to production if testing locally');
        console.log('2. Test the subscription in eBay Developer Portal');
        console.log('3. Send a test notification from eBay');
    } else {
        console.log('\n⚠️  The 401 error is still present or other issues exist.');
        console.log('\n🔧 Potential fixes to check:');
        console.log('- Ensure the server is running');
        console.log('- Verify middleware order in src/api/index.js');
        console.log('- Check that authentication middleware is bypassed for /partsmatrix');
        console.log('- Confirm CORS headers are set properly');
    }
    
    console.log('\n📝 Detailed Results:');
    results.tests.forEach(test => {
        const icon = test.passed ? '✅' : '❌';
        console.log(`   ${icon} ${test.testName}: ${test.message}`);
    });
    
    console.log(`\n🔗 Tested endpoint: ${currentConfig.protocol}://${currentConfig.host}:${currentConfig.port}/api/partsmatrix`);
}

// Run the tests
runAllTests().catch(console.error);
