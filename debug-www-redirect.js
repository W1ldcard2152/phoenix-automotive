// Quick debug script to test www redirect behavior

import https from 'https';

console.log('🔍 Testing www redirect behavior...\n');

const urls = [
    'https://phxautogroup.com/api/partsmatrix/health',
    'https://www.phxautogroup.com/api/partsmatrix/health'
];

function testUrl(url) {
    return new Promise((resolve) => {
        console.log(`Testing: ${url}`);
        
        const urlObj = new URL(url);
        const options = {
            hostname: urlObj.hostname,
            port: 443,
            path: urlObj.pathname,
            method: 'GET',
            headers: {
                'User-Agent': 'eBayTestClient/1.0'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log(`  Status: ${res.statusCode}`);
                console.log(`  Headers: ${JSON.stringify(res.headers, null, 2)}`);
                if (res.statusCode >= 300 && res.statusCode < 400) {
                    console.log(`  Redirect to: ${res.headers.location}`);
                }
                console.log(`  Response: ${data.substring(0, 200)}${data.length > 200 ? '...' : ''}`);
                console.log('');
                resolve();
            });
        });

        req.on('error', (error) => {
            console.log(`  Error: ${error.message}\n`);
            resolve();
        });

        req.end();
    });
}

async function runTests() {
    for (const url of urls) {
        await testUrl(url);
    }
    
    console.log('✅ Debug tests completed');
    console.log('\n💡 If non-www redirects to www, update your eBay endpoint URL to use www');
}

runTests();
