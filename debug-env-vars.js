// Environment Diagnostic Script
// This will help us understand why the server isn't loading new .env values

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname);

console.log('🔍 Environment Variable Diagnostic');
console.log('=' .repeat(50));

// Test 1: Check current working directory
console.log('\n1. 📂 Directory Information:');
console.log(`   Current working directory: ${process.cwd()}`);
console.log(`   Script directory: ${__dirname}`);
console.log(`   Project root: ${projectRoot}`);

// Test 2: Check .env file exists and is readable
console.log('\n2. 📄 .env File Check:');
const envPath = path.join(projectRoot, '.env');
console.log(`   .env path: ${envPath}`);

try {
    if (fs.existsSync(envPath)) {
        console.log('   ✅ .env file exists');
        const stats = fs.statSync(envPath);
        console.log(`   📅 Modified: ${stats.mtime}`);
        console.log(`   📏 Size: ${stats.size} bytes`);
        
        // Read the .env file content
        const envContent = fs.readFileSync(envPath, 'utf8');
        const lines = envContent.split('\n');
        const ebayLines = lines.filter(line => line.includes('EBAY'));
        
        console.log('   🔍 eBay-related lines in .env:');
        ebayLines.forEach(line => {
            if (line.trim() && !line.startsWith('#')) {
                console.log(`     ${line}`);
            }
        });
    } else {
        console.log('   ❌ .env file does not exist');
    }
} catch (error) {
    console.log(`   ❌ Error reading .env file: ${error.message}`);
}

// Test 3: Manually load .env and check values
console.log('\n3. 🔄 Manual .env Loading:');
try {
    dotenv.config({ path: envPath });
    console.log('   ✅ dotenv.config() executed');
    console.log(`   EBAY_VERIFICATION_TOKEN: ${process.env.EBAY_VERIFICATION_TOKEN ? process.env.EBAY_VERIFICATION_TOKEN.substring(0, 15) + '...' : 'NOT SET'}`);
    console.log(`   EBAY_ENDPOINT_URL: ${process.env.EBAY_ENDPOINT_URL || 'NOT SET'}`);
} catch (error) {
    console.log(`   ❌ Error loading .env: ${error.message}`);
}

// Test 4: Check all environment variables containing 'EBAY'
console.log('\n4. 🌍 All eBay Environment Variables:');
Object.keys(process.env).forEach(key => {
    if (key.includes('EBAY')) {
        const value = process.env[key];
        if (key.includes('TOKEN')) {
            console.log(`   ${key}: ${value ? value.substring(0, 15) + '...' : 'NOT SET'}`);
        } else {
            console.log(`   ${key}: ${value || 'NOT SET'}`);
        }
    }
});

// Test 5: Test the exact same configuration loading as EbayCompliance.js
console.log('\n5. 🔧 Simulating EbayCompliance.js Configuration:');
try {
    // Reset and reload environment
    delete process.env.EBAY_VERIFICATION_TOKEN;
    delete process.env.EBAY_ENDPOINT_URL;
    
    dotenv.config({ path: path.join(projectRoot, '.env') });
    
    const EBAY_CONFIG = {
        verificationToken: process.env.EBAY_VERIFICATION_TOKEN || '',
        endpointUrl: process.env.EBAY_ENDPOINT_URL || 'https://www.phxautogroup.com/api/partsmatrix',
    };
    
    console.log('   Simulated EBAY_CONFIG:');
    console.log(`     verificationToken: ${EBAY_CONFIG.verificationToken ? EBAY_CONFIG.verificationToken.substring(0, 15) + '...' : 'EMPTY'}`);
    console.log(`     endpointUrl: ${EBAY_CONFIG.endpointUrl}`);
    
    // Test hash calculation with current config
    console.log('\n6. 🧮 Hash Calculation Test:');
    const testChallenge = 'test_challenge_12345';
    const crypto = await import('crypto');
    
    const hashInput = testChallenge + EBAY_CONFIG.verificationToken + EBAY_CONFIG.endpointUrl;
    const hash = crypto.createHash('sha256').update(hashInput, 'utf8').digest('hex');
    
    console.log(`   Test challenge: ${testChallenge}`);
    console.log(`   Hash input: ${hashInput}`);
    console.log(`   Generated hash: ${hash}`);
    
} catch (error) {
    console.log(`   ❌ Error in simulation: ${error.message}`);
}

console.log('\n' + '=' .repeat(50));
console.log('📋 Summary:');
console.log('If EBAY_ENDPOINT_URL still shows the old value (without www),');
console.log('the server process may not be reading the updated .env file.');
console.log('\n💡 Try:');
console.log('1. Kill all node processes: pkill -f node');
console.log('2. Start server again');
console.log('3. Check server startup logs for environment loading');
