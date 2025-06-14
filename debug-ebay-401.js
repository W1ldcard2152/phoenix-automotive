#!/usr/bin/env node

/**
 * Debug Script for eBay 401 Error
 * 
 * This script helps diagnose the 401 authentication error
 * when eBay tries to send notifications to your endpoint.
 */

import https from 'https';
import http from 'http';
import crypto from 'crypto';

// Configuration
const CONFIG = {
    local: {
        protocol: 'http',
        host: 'localhost',
        port: 3000
    },
    production: {
        protocol: 'https', 
        host: 'www.phxautogroup.com',
        port: 443
    }
};

// Test results collector
const results = {
    passed: 0,
    failed: 0,
    tests: []
};

function addResult(testName, passed, details) {
    results.tests.push({ testName, passed, details });
    if (passed) {
        results.passed++;
        console.log(`✅ ${testName}: ${details}`);
    } else {
        results.failed++;
        console.log(`❌ ${testName}: ${details}`);
    }
}

// Helper function to make HTTP requests
function makeRequest(options, postData = null) {
    return new Promise((resolve, reject) => {
        const lib = options.protocol === 'https:' ? https : http;
        
        const req = lib.request(options, (res) => {
            let rawData = '';
            res.on('data', (chunk) => rawData += chunk);
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

        req.on('error', (error) => {
            reject(new Error(`Request failed: ${error.message}`));
        });

        if (postData) {
            req.write(postData);
        }
        
        req.end();
    });
}

// Test 1: Basic health check
async function testHealthCheck(config) {
    console.log('\n🔍 Testing health check...');
    
    try {
        const response = await makeRequest({
            hostname: config.host,
            port: config.port,
            path: '/api/health',
            method: 'GET',
            protocol: config.protocol + ':'
        });

        if (response.statusCode === 200) {
            addResult('Health Check', true, 'API is responsive');
            
            if (response.data && response.data.ebayConfig) {
                console.log('📊 eBay Configuration:', response.data.ebayConfig);
            }
        } else {
            addResult('Health Check', false, `HTTP ${response.statusCode}: ${response.rawData}`);
        }
    } catch (error) {
        addResult('Health Check', false, `Connection error: ${error.message}`);
    }
}

// Test 2: eBay endpoint health
async function testEbayHealth(config) {
    console.log('\n🔍 Testing eBay endpoint health...');
    
    try {
        const response = await makeRequest({
            hostname: config.host,
            port: config.port,
            path: '/api/partsmatrix/health',
            method: 'GET',
            protocol: config.protocol + ':'
        });

        if (response.statusCode === 200) {
            addResult('eBay Health Check', true, 'eBay endpoint is accessible');
            console.log('📊 eBay Endpoint Status:', response.data);
        } else {
            addResult('eBay Health Check', false, `HTTP ${response.statusCode}: ${response.rawData}`);
        }
    } catch (error) {
        addResult('eBay Health Check', false, `Connection error: ${error.message}`);
    }
}

// Test 3: Simulate eBay challenge verification
async function testEbayChallenge(config) {
    console.log('\n🔍 Testing eBay challenge verification...');
    
    const challengeCode = `test_challenge_${Date.now()}`;
    
    try {
        const response = await makeRequest({
            hostname: config.host,
            port: config.port,
            path: `/api/partsmatrix?challenge_code=${challengeCode}`,
            method: 'GET',
            headers: {
                'User-Agent': 'eBay-Notification-Service/1.0',
                'Accept': 'application/json'
            },
            protocol: config.protocol + ':'
        });

        if (response.statusCode === 200 && response.data && response.data.challengeResponse) {
            addResult('eBay Challenge', true, 'Challenge verification successful');
            console.log('🔑 Challenge Response:', response.data.challengeResponse);
        } else {
            addResult('eBay Challenge', false, `HTTP ${response.statusCode}: ${response.rawData}`);
        }
    } catch (error) {
        addResult('eBay Challenge', false, `Connection error: ${error.message}`);
    }
}

// Test 4: Simulate eBay notification without auth headers (the 401 issue)
async function testEbayNotificationNoAuth(config) {
    console.log('\n🔍 Testing eBay notification without auth headers (reproducing 401)...');
    
    const mockPayload = {
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
                userId: "debug_test_id",
                eiasToken: "debug_test_token"
            }
        }
    };
    
    const postData = JSON.stringify(mockPayload);
    
    try {
        const response = await makeRequest({
            hostname: config.host,
            port: config.port,
            path: '/api/partsmatrix',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData),
                'User-Agent': 'eBay-Notification-Service/1.0',
                // Deliberately NOT including Authorization header to mimic eBay
            },
            protocol: config.protocol + ':'
        }, postData);

        if (response.statusCode === 200) {
            addResult('eBay Notification (No Auth)', true, 'Notification processed successfully without auth header');
        } else if (response.statusCode === 401) {
            addResult('eBay Notification (No Auth)', false, `🚨 401 UNAUTHORIZED - This is the issue eBay is experiencing! Response: ${response.rawData}`);
        } else {
            addResult('eBay Notification (No Auth)', false, `HTTP ${response.statusCode}: ${response.rawData}`);
        }
    } catch (error) {
        addResult('eBay Notification (No Auth)', false, `Connection error: ${error.message}`);
    }
}

// Test 5: Test with various headers that might be causing issues
async function testEbayNotificationWithHeaders(config) {
    console.log('\n🔍 Testing eBay notification with various headers...');
    
    const mockPayload = {
        metadata: {
            topic: "MARKETPLACE_ACCOUNT_DELETION",
            schemaVersion: "1.0",
            deprecated: false
        },
        notification: {
            notificationId: `header_test_${Date.now()}`,
            eventDate: new Date().toISOString(),
            publishDate: new Date().toISOString(),
            publishAttemptCount: 1,
            data: {
                username: "header_test_user",
                userId: "header_test_id",
                eiasToken: "header_test_token"
            }
        }
    };
    
    const postData = JSON.stringify(mockPayload);
    
    const testCases = [
        {
            name: 'With X-EBAY headers',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData),
                'User-Agent': 'eBay-Notification-Service/1.0',
                'X-EBAY-SIGNATURE': 'dummy_signature',
                'X-EBAY-TIMESTAMP': Date.now().toString()
            }
        },
        {
            name: 'Minimal headers',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'eBay-Notification-Service/1.0'
            }
        },
        {
            name: 'With Connection header',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'eBay-Notification-Service/1.0',
                'Connection': 'close'
            }
        }
    ];
    
    for (const testCase of testCases) {
        try {
            const response = await makeRequest({
                hostname: config.host,
                port: config.port,
                path: '/api/partsmatrix',
                method: 'POST',
                headers: testCase.headers,
                protocol: config.protocol + ':'
            }, postData);

            if (response.statusCode === 200) {
                addResult(`Headers Test: ${testCase.name}`, true, 'Request successful');
            } else {
                addResult(`Headers Test: ${testCase.name}`, false, `HTTP ${response.statusCode}: ${response.rawData}`);
            }
        } catch (error) {
            addResult(`Headers Test: ${testCase.name}`, false, `Connection error: ${error.message}`);
        }
    }
}

// Test 6: Test OPTIONS preflight
async function testOptionsRequest(config) {
    console.log('\n🔍 Testing OPTIONS preflight request...');
    
    try {
        const response = await makeRequest({
            hostname: config.host,
            port: config.port,
            path: '/api/partsmatrix',
            method: 'OPTIONS',
            headers: {
                'Origin': 'https://notifications.ebay.com',
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type, X-EBAY-SIGNATURE'
            },
            protocol: config.protocol + ':'
        });

        if (response.statusCode === 200 || response.statusCode === 204) {
            addResult('OPTIONS Preflight', true, `OPTIONS request successful (${response.statusCode})`);
            console.log('📋 CORS Headers:', response.headers);
        } else {
            addResult('OPTIONS Preflight', false, `HTTP ${response.statusCode}: ${response.rawData}`);
        }
    } catch (error) {
        addResult('OPTIONS Preflight', false, `Connection error: ${error.message}`);
    }
}

// Main test runner
async function runDiagnostics() {
    const environment = process.argv[2] || 'production';
    const config = CONFIG[environment];
    
    if (!config) {
        console.error('❌ Invalid environment. Use: local or production');
        process.exit(1);
    }
    
    console.log('🚀 Starting eBay 401 Error Diagnostics');
    console.log('=' * 60);
    console.log(`📍 Testing: ${config.protocol}://${config.host}:${config.port}`);
    console.log(`🌍 Environment: ${environment}`);
    console.log('=' * 60);
    
    // Run all tests
    await testHealthCheck(config);
    await testEbayHealth(config);
    await testEbayChallenge(config);
    await testEbayNotificationNoAuth(config);
    await testEbayNotificationWithHeaders(config);
    await testOptionsRequest(config);
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 DIAGNOSTIC RESULTS SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`📈 Success Rate: ${Math.round((results.passed / (results.passed + results.failed)) * 100)}%`);
    
    if (results.failed === 0) {
        console.log('\n🎉 All tests passed! The 401 issue should be resolved.');
    } else {
        console.log('\n⚠️  Some tests failed. Focus on these issues:');
        
        results.tests.filter(test => !test.passed).forEach(test => {
            console.log(`   ❌ ${test.testName}: ${test.details}`);
        });
        
        console.log('\n🔧 Common solutions for 401 errors:');
        console.log('1. Ensure the eBay route is mounted BEFORE authentication middleware');
        console.log('2. Check that no global auth middleware is intercepting eBay requests');
        console.log('3. Verify CORS headers allow eBay origins');
        console.log('4. Ensure the endpoint handles requests without Authorization headers');
        console.log('5. Check server logs for middleware conflicts');
    }
    
    console.log('\n📝 Next Steps:');
    console.log('- If tests pass but eBay still reports 401, check server logs during eBay test');
    console.log('- Contact eBay support if the endpoint works but they still report failures');
    console.log('- Consider using a webhook testing tool to simulate exact eBay requests');
}

// Command line help
if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(`
eBay 401 Error Diagnostic Tool

Usage:
  node debug-ebay-401.js [environment]

Environments:
  local        Test against http://localhost:3000 (default for development)
  production   Test against https://www.phxautogroup.com (default)

Examples:
  node debug-ebay-401.js production
  node debug-ebay-401.js local

This tool will test various scenarios to identify why eBay is receiving 401 errors
when trying to send notifications to your marketplace deletion endpoint.
`);
    process.exit(0);
}

// Run the diagnostics
runDiagnostics().catch(error => {
    console.error('❌ Fatal error during diagnostics:', error);
    process.exit(1);
});
