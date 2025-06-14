#!/usr/bin/env node

/**
 * eBay Authentication Debug Script
 * Helps identify exactly why eBay requests might be getting 401 errors
 * 
 * This script simulates exactly what eBay sends and logs every step
 */

import https from 'https';
import http from 'http';

const config = {
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

const env = process.argv.includes('--prod') ? 'production' : 'local';
const target = config[env];

console.log('🔍 eBay Authentication Debug Tool');
console.log(`📍 Testing: ${target.protocol}://${target.host}:${target.port}/api/partsmatrix`);
console.log('=' * 70);

function makeRequest(options, data = null) {
    return new Promise((resolve, reject) => {
        console.log('\n📤 Sending request:');
        console.log(`   Method: ${options.method}`);
        console.log(`   Path: ${options.path}`);
        console.log(`   Headers:`, options.headers);
        if (data) {
            console.log(`   Body: ${data.substring(0, 200)}${data.length > 200 ? '...' : ''}`);
        }

        const lib = options.protocol === 'https:' ? https : http;
        
        const req = lib.request(options, (res) => {
            console.log('\n📥 Response received:');
            console.log(`   Status: ${res.statusCode} ${res.statusMessage}`);
            console.log(`   Headers:`, res.headers);

            let rawData = '';
            res.on('data', (chunk) => {
                rawData += chunk;
            });
            
            res.on('end', () => {
                if (rawData) {
                    console.log(`   Body: ${rawData}`);
                }
                
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
            console.log(`\n❌ Request error: ${err.message}`);
            reject(err);
        });

        if (data) {
            req.write(data);
        }
        
        req.end();
    });
}

async function testEbayRequest() {
    console.log('\n🧪 Test 1: Simulating exact eBay webhook request');
    
    // This simulates exactly what eBay sends
    const payload = JSON.stringify({
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
    });

    try {
        const response = await makeRequest({
            hostname: target.host,
            port: target.port,
            path: '/api/partsmatrix',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload),
                'User-Agent': 'eBay-Notification-Service/1.0',
                'Accept': 'application/json',
                'Host': target.host,
                'Connection': 'close'
                // Note: eBay does NOT send Authorization headers
            },
            protocol: target.protocol + ':'
        }, payload);

        console.log('\n📊 Analysis:');
        if (response.statusCode === 401) {
            console.log('❌ PROBLEM: Getting 401 Unauthorized');
            console.log('🔧 This means authentication middleware is still blocking the request');
            console.log('💡 Check that /partsmatrix route is mounted BEFORE auth middleware');
        } else if (response.statusCode === 200) {
            console.log('✅ SUCCESS: Request accepted (200 OK)');
            console.log('🎉 The 401 issue appears to be fixed!');
        } else {
            console.log(`⚠️  Unexpected status: ${response.statusCode}`);
        }

    } catch (error) {
        console.log(`\n❌ Connection failed: ${error.message}`);
        console.log('💡 Make sure the server is running');
    }
}

async function testWithFakeAuth() {
    console.log('\n🧪 Test 2: Testing with fake Authorization header');
    
    const payload = JSON.stringify({
        metadata: {
            topic: "MARKETPLACE_ACCOUNT_DELETION",
            schemaVersion: "1.0",
            deprecated: false
        },
        notification: {
            notificationId: `debug_auth_test_${Date.now()}`,
            eventDate: new Date().toISOString(),
            publishDate: new Date().toISOString(),
            publishAttemptCount: 1,
            data: {
                username: "debug_auth_test_user",
                userId: "debug_auth_test_user_id",
                eiasToken: "debug_auth_test_eias_token"
            }
        }
    });

    try {
        const response = await makeRequest({
            hostname: target.host,
            port: target.port,
            path: '/api/partsmatrix',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload),
                'Authorization': 'Bearer fake_token_12345',
                'User-Agent': 'Test-Agent/1.0'
            },
            protocol: target.protocol + ':'
        }, payload);

        console.log('\n📊 Analysis:');
        if (response.statusCode === 401) {
            console.log('❌ PROBLEM: Still getting 401 even with fake auth header');
            console.log('🔧 The middleware order needs to be fixed');
        } else if (response.statusCode === 200) {
            console.log('✅ SUCCESS: Auth header is properly ignored');
        } else {
            console.log(`⚠️  Unexpected status: ${response.statusCode}`);
        }

    } catch (error) {
        console.log(`\n❌ Connection failed: ${error.message}`);
    }
}

async function testChallengeCode() {
    console.log('\n🧪 Test 3: Testing eBay challenge code verification');
    
    const challengeCode = 'debug_challenge_' + Date.now();
    
    try {
        const response = await makeRequest({
            hostname: target.host,
            port: target.port,
            path: `/api/partsmatrix?challenge_code=${challengeCode}`,
            method: 'GET',
            headers: {
                'User-Agent': 'eBay-Notification-Service/1.0',
                'Accept': 'application/json',
                'Host': target.host,
                'Connection': 'close'
            },
            protocol: target.protocol + ':'
        });

        console.log('\n📊 Analysis:');
        if (response.statusCode === 401) {
            console.log('❌ PROBLEM: Challenge code verification getting 401');
        } else if (response.statusCode === 200 && response.data && response.data.challengeResponse) {
            console.log('✅ SUCCESS: Challenge code verification working');
        } else {
            console.log(`⚠️  Unexpected response: ${response.statusCode}`);
        }

    } catch (error) {
        console.log(`\n❌ Connection failed: ${error.message}`);
    }
}

async function runDebugTests() {
    await testEbayRequest();
    await testWithFakeAuth();
    await testChallengeCode();
    
    console.log('\n' + '='.repeat(70));
    console.log('🎯 SUMMARY');
    console.log('='.repeat(70));
    console.log('If you see 401 errors above, the issue is likely:');
    console.log('1. Authentication middleware running before eBay routes');
    console.log('2. Missing route configuration in src/api/index.js');
    console.log('3. Server-level middleware interference');
    console.log('');
    console.log('If all tests show 200 OK, the 401 issue is fixed! 🎉');
    console.log('');
    console.log('Next: Test with eBay Developer Portal');
}

runDebugTests().catch(console.error);
