// Test to see which headers are actually being sent by the server
import https from 'https';

console.log('🔍 Header Conflict Debug Test');
console.log('=' .repeat(50));

// Test both health and challenge endpoints
const endpoints = [
    { name: 'Health Endpoint', path: '/api/partsmatrix/health' },
    { name: 'Challenge Endpoint', path: '/api/partsmatrix?challenge_code=debug_test_' + Date.now() }
];

async function testEndpoint(endpoint) {
    return new Promise((resolve) => {
        console.log(`\n🧪 Testing: ${endpoint.name}`);
        console.log(`   Path: ${endpoint.path}`);
        
        const options = {
            hostname: 'www.phxautogroup.com',
            port: 443,
            path: endpoint.path,
            method: 'GET',
            headers: {
                'User-Agent': 'HeaderDebugTest/1.0'
            }
        };

        const req = https.request(options, (res) => {
            console.log(`   Status: ${res.statusCode}`);
            
            // Check for multiple cache-control headers
            const cacheControl = res.headers['cache-control'];
            const pragma = res.headers['pragma'];
            const expires = res.headers['expires'];
            
            console.log(`   Cache-Control: ${cacheControl || 'MISSING'}`);
            console.log(`   Pragma: ${pragma || 'MISSING'}`);
            console.log(`   Expires: ${expires || 'MISSING'}`);
            
            // Check if headers were overridden
            if (cacheControl && cacheControl.includes('proxy-revalidate')) {
                console.log(`   🚨 Using security middleware headers (includes proxy-revalidate)`);
            } else if (cacheControl && cacheControl.includes('no-cache, no-store, must-revalidate')) {
                console.log(`   ✅ Using eBay middleware headers`);
            } else {
                console.log(`   ❓ Unknown header source`);
            }
            
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve();
            });
        });

        req.on('error', (error) => {
            console.log(`   ❌ Error: ${error.message}`);
            resolve();
        });

        req.end();
    });
}

async function runTests() {
    for (const endpoint of endpoints) {
        await testEndpoint(endpoint);
    }
    
    console.log('\n📋 Analysis:');
    console.log('- If headers show "proxy-revalidate": Security middleware is overriding');
    console.log('- If headers show "no-cache, no-store, must-revalidate": eBay middleware working');
    console.log('- If headers are MISSING: Middleware not running at all');
    
    console.log('\n🔧 Next steps:');
    console.log('1. Restart server after security.js fix');
    console.log('2. Run comprehensive test again');
}

runTests();
