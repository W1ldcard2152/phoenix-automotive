// Quick test to verify environment loading works
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Environment Loading Test');
console.log('=' .repeat(40));

// Test path resolution like server.js
const projectRoot = path.resolve(__dirname, './');
const envPath = path.join(projectRoot, '.env');
console.log(`Project root: ${projectRoot}`);
console.log(`Env path: ${envPath}`);

// Load environment
dotenv.config({ path: envPath });

console.log('\n📊 Environment Variables:');
console.log(`EBAY_ENDPOINT_URL: ${process.env.EBAY_ENDPOINT_URL || 'NOT SET'}`);
console.log(`EBAY_VERIFICATION_TOKEN: ${process.env.EBAY_VERIFICATION_TOKEN ? 'SET (' + process.env.EBAY_VERIFICATION_TOKEN.length + ' chars)' : 'NOT SET'}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'NOT SET'}`);

// Test like EbayCompliance.js would
const config = {
    verificationToken: process.env.EBAY_VERIFICATION_TOKEN || '',
    endpointUrl: process.env.EBAY_ENDPOINT_URL || 'https://www.phxautogroup.com/api/partsmatrix',
};

console.log('\n🔧 Generated Config:');
console.log(`endpointUrl: ${config.endpointUrl}`);
console.log(`verificationToken: ${config.verificationToken ? 'SET' : 'NOT SET'}`);

console.log('\n✅ Test complete');
