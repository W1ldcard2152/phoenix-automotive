// Test specifically for Cache-Control header issue
import https from 'https';

console.log('🔍 Cache-Control Header Test');
console.log('='.repeat(40));

const testChallenge = 'cache_test_' + Date.now();

const options = {
    hostname: 'www.phxautogroup.com',
    port: 443,
    path: `/api/partsmatrix?challenge_code=${testChallenge}`,
    method: 'GET',
    headers: {
        'User-Agent': 'CacheHeaderTest/1.0',
        'Accept': 'application/json'
    }
};

console.log(`Testing: ${options.hostname}${options.path}`);

const req = https.request(options, (res) => {
    console.log(`\n📊 Response Status: ${res.statusCode}`);
    console.log('\n📋 Response Headers:');
    
    Object.keys(res.headers).forEach(key => {
        console.log(`   ${key}: ${res.headers[key]}`);
    });
    
    console.log('\n🔍 Specific Header Checks:');
    console.log(`   Content-Type: ${res.headers['content-type'] || 'MISSING'}`);
    console.log(`   Cache-Control: ${res.headers['cache-control'] || 'MISSING'}`);
    console.log(`   Pragma: ${res.headers['pragma'] || 'MISSING'}`);
    console.log(`   Expires: ${res.headers['expires'] || 'MISSING'}`);
    
    // Check if headers are set correctly
    const hasContentType = res.headers['content-type'] && res.headers['content-type'].includes('application/json');
    const hasCacheControl = res.headers['cache-control'] && res.headers['cache-control'].includes('no-cache');
    
    console.log('\n✅ Header Validation:');
    console.log(`   Content-Type JSON: ${hasContentType ? 'PASS' : 'FAIL'}`);
    console.log(`   Cache-Control no-cache: ${hasCacheControl ? 'PASS' : 'FAIL'}`);
    
    if (!hasCacheControl) {
        console.log('\n❌ Cache-Control header issue detected!');
        console.log('💡 The middleware may not be applying headers properly');
    }
    
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log(`\n📄 Response body: ${data.substring(0, 200)}${data.length > 200 ? '...' : ''}`);
    });
});

req.on('error', (error) => {
    console.error(`❌ Request failed: ${error.message}`);
});

req.end();
