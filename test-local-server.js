// Test the LOCAL development server instead of production
import https from 'https';
import http from 'http';
import crypto from 'crypto';

// Configuration for LOCAL development server
const CONFIG = {
    host: 'localhost',
    port: 3000,
    protocol: 'http',
    verificationToken: 'FukPTXCa1Ip4gkhoJ33p6iIHM4FESCkzzDqHfuaxKlUrWRKmFMlqELtGwXHB4jhc',
    endpointUrl: 'https://www.phxautogroup.com/api/partsmatrix'
};

console.log('🧪 LOCAL Development Server Test');
console.log('=' .repeat(50));
console.log(`Testing LOCAL server at: http://${CONFIG.host}:${CONFIG.port}`);
console.log('(This tests your dev server, not production)');
console.log('=' .repeat(50));

// Helper function for HTTP requests to localhost
function makeLocalRequest(options, postData = null) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsedData = data.trim() ? JSON.parse(data) : null;
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

async function testLocalHealth() {
    console.log('\n1. 🏥 Testing LOCAL Health Endpoint...');
    
    try {
        const options = {
            hostname: CONFIG.host,
            port: CONFIG.port,
            path: '/api/partsmatrix/health',
            method: 'GET'
        };

        const response = await makeLocalRequest(options);
        
        if (response.statusCode === 200 && response.data) {
            console.log('   ✅ Local health endpoint responding');
            console.log(`   Status: ${response.data.status}`);
            console.log(`   Endpoint: ${response.data.endpoint}`);
            console.log(`   Has Token: ${response.data.hasVerificationToken}`);
            console.log(`   Environment: ${response.data.environment}`);
            
            return response.data;
        } else {
            console.log(`   ❌ Health check failed: ${response.statusCode}`);
            console.log(`   Response: ${response.rawData}`);
            return null;
        }
    } catch (error) {
        console.log(`   ❌ Health check error: ${error.message}`);
        console.log('   💡 Make sure your local server is running on port 3000');
        return null;
    }
}

async function testLocalChallenge(healthData) {
    console.log('\n2. 🔐 Testing LOCAL Challenge Verification...');
    
    const challengeCode = 'local_test_' + Date.now();
    
    try {
        const options = {
            hostname: CONFIG.host,
            port: CONFIG.port,
            path: `/api/partsmatrix?challenge_code=${challengeCode}`,
            method: 'GET'
        };

        console.log(`   Request: http://${CONFIG.host}:${CONFIG.port}/api/partsmatrix?challenge_code=${challengeCode}`);

        const response = await makeLocalRequest(options);
        
        if (response.statusCode === 200 && response.data) {
            const receivedHash = response.data.challengeResponse;
            
            // Calculate expected hash using server's endpoint from health check
            const serverEndpoint = healthData ? healthData.endpoint : CONFIG.endpointUrl;
            const expectedHashInput = challengeCode + CONFIG.verificationToken + serverEndpoint;
            const expectedHash = crypto.createHash('sha256').update(expectedHashInput, 'utf8').digest('hex');
            
            console.log(`   Challenge: ${challengeCode}`);
            console.log(`   Server endpoint: ${serverEndpoint}`);
            console.log(`   Expected hash: ${expectedHash}`);
            console.log(`   Received hash: ${receivedHash}`);
            
            if (expectedHash === receivedHash) {
                console.log('   ✅ Hash verification PASSED!');
                return true;
            } else {
                console.log('   ❌ Hash mismatch');
                console.log(`   Hash input: ${expectedHashInput}`);
                return false;
            }
        } else {
            console.log(`   ❌ Challenge failed: ${response.statusCode}`);
            console.log(`   Response: ${response.rawData}`);
            return false;
        }
    } catch (error) {
        console.log(`   ❌ Challenge error: ${error.message}`);
        return false;
    }
}

async function testLocalHeaders() {
    console.log('\n3. 📋 Testing LOCAL Headers...');
    
    const challengeCode = 'header_test_' + Date.now();
    
    try {
        const options = {
            hostname: CONFIG.host,
            port: CONFIG.port,
            path: `/api/partsmatrix?challenge_code=${challengeCode}`,
            method: 'GET'
        };

        const response = await makeLocalRequest(options);
        
        console.log(`   Content-Type: ${response.headers['content-type'] || 'MISSING'}`);
        console.log(`   Cache-Control: ${response.headers['cache-control'] || 'MISSING'}`);
        console.log(`   Pragma: ${response.headers['pragma'] || 'MISSING'}`);
        console.log(`   Expires: ${response.headers['expires'] || 'MISSING'}`);
        
        const hasCorrectHeaders = 
            response.headers['content-type'] && 
            response.headers['content-type'].includes('application/json') &&
            response.headers['cache-control'] && 
            response.headers['cache-control'].includes('no-cache');
            
        if (hasCorrectHeaders) {
            console.log('   ✅ Headers are correct!');
            return true;
        } else {
            console.log('   ❌ Headers missing or incorrect');
            return false;
        }
    } catch (error) {
        console.log(`   ❌ Header test error: ${error.message}`);
        return false;
    }
}

async function runLocalTests() {
    console.log('⏰ Starting LOCAL server tests...\n');
    
    const healthData = await testLocalHealth();
    if (!healthData) {
        console.log('\n❌ Cannot continue - health check failed');
        console.log('💡 Make sure your local server is running: npm run dev:server');
        return;
    }
    
    const challengePass = await testLocalChallenge(healthData);
    const headersPass = await testLocalHeaders();
    
    console.log('\n📊 LOCAL SERVER TEST RESULTS:');
    console.log('=' .repeat(40));
    console.log(`Health Check: ✅ PASS`);
    console.log(`Challenge Verification: ${challengePass ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Headers: ${headersPass ? '✅ PASS' : '❌ FAIL'}`);
    
    const totalPassed = 1 + (challengePass ? 1 : 0) + (headersPass ? 1 : 0);
    console.log(`\nSuccess Rate: ${totalPassed}/3 (${Math.round(totalPassed/3*100)}%)`);
    
    if (challengePass && headersPass) {
        console.log('\n🎉 LOCAL SERVER IS WORKING CORRECTLY!');
        console.log('\n📝 Next Steps:');
        console.log('1. Your local development server is configured correctly');
        console.log('2. Deploy these changes to production (www.phxautogroup.com)');
        console.log('3. Update eBay Developer Portal to use your production endpoint');
    } else {
        console.log('\n🔧 Issues found with local server - need to debug further');
    }
}

runLocalTests().catch(error => {
    console.error('Test failed:', error);
});
