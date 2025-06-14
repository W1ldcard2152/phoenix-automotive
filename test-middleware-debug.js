// Quick test to verify if our middleware debugging is working
import https from 'https';

console.log('🔍 Middleware Debug Test');
console.log('This test will help us see if the middleware is running');
console.log('=' .repeat(60));

console.log('\n📋 What to look for in your server logs:');
console.log('1. [Server] Loading .env from: ...');
console.log('2. [EbayCompliance] Loading .env from: ...');
console.log('3. [EbayCompliance] EBAY_ENDPOINT_URL: https://www.phxautogroup.com/api/partsmatrix');
console.log('4. [EbayMiddleware] Processing GET /');
console.log('5. [EbayMiddleware] Headers set for GET /');
console.log('6. eBay challenge request received: ...');
console.log('7. configEndpoint: https://www.phxautogroup.com/api/partsmatrix');
console.log('8. Hash input: [challenge + token + url]');

const testChallenge = 'middleware_test_' + Date.now();

console.log(`\n🧪 Making request with challenge: ${testChallenge}`);
console.log('👀 Watch your server logs now...');

const options = {
    hostname: 'www.phxautogroup.com',
    port: 443,
    path: `/api/partsmatrix?challenge_code=${testChallenge}`,
    method: 'GET',
    headers: {
        'User-Agent': 'MiddlewareDebugTest/1.0'
    }
};

const req = https.request(options, (res) => {
    console.log(`\n📊 Response Status: ${res.statusCode}`);
    console.log('Cache-Control:', res.headers['cache-control'] || 'MISSING');
    console.log('Pragma:', res.headers['pragma'] || 'MISSING');
    
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            const response = JSON.parse(data);
            console.log(`Response Hash: ${response.challengeResponse}`);
            
            console.log('\n🎯 Analysis:');
            if (res.headers['cache-control']) {
                console.log('✅ Cache headers present - middleware is working');
            } else {
                console.log('❌ Cache headers missing - server may need restart');
            }
            
            console.log('\n💡 If you see [EbayMiddleware] logs: Middleware is running');
            console.log('💡 If you see configEndpoint with www: Environment is correct');
            console.log('💡 If cache headers still missing: Need to restart server');
            
        } catch (error) {
            console.log('Failed to parse response');
        }
    });
});

req.on('error', (error) => {
    console.error(`❌ Request failed: ${error.message}`);
});

req.end();
