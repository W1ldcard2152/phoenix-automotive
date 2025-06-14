// Manual challenge test to see server logs
import https from 'https';

console.log('🧪 Manual Challenge Test');
console.log('This will make a challenge request and you should see server logs');
console.log('='.repeat(60));

const testChallenge = 'manual_debug_test_' + Date.now();

const options = {
    hostname: 'www.phxautogroup.com',
    port: 443,
    path: `/api/partsmatrix?challenge_code=${testChallenge}`,
    method: 'GET',
    headers: {
        'User-Agent': 'DebugTest/1.0',
        'Accept': 'application/json'
    }
};

console.log(`Making request to: https://www.phxautogroup.com/api/partsmatrix?challenge_code=${testChallenge}`);
console.log('\n📋 Check your server logs for:');
console.log('- [EbayCompliance] messages showing environment loading');
console.log('- "configEndpoint" value in the challenge request log');
console.log('- "Hash input" showing the actual string being hashed');

const req = https.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log(`\n📊 Response received (${res.statusCode}):`);
        console.log(`Headers: ${JSON.stringify(res.headers, null, 2)}`);
        console.log(`Body: ${data}`);
        
        if (res.statusCode === 200) {
            try {
                const response = JSON.parse(data);
                console.log(`\n🔐 Challenge Response Hash: ${response.challengeResponse}`);
                console.log('\n💡 Compare this hash with what your server logs show');
                console.log('💡 The server logs should show the exact "Hash input" string used');
            } catch (e) {
                console.log('Failed to parse JSON response');
            }
        }
    });
});

req.on('error', (error) => {
    console.error(`❌ Request failed: ${error.message}`);
});

req.end();
