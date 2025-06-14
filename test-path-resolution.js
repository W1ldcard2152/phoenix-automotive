// Test the exact path resolution logic used in our files
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Path Resolution Test');
console.log('=' .repeat(40));

console.log(`Script location: ${__filename}`);
console.log(`Script __dirname: ${__dirname}`);

// Test 1: Test script path (should be project root)
const testProjectRoot = path.resolve(__dirname, './');
const testEnvPath = path.join(testProjectRoot, '.env');
console.log(`\n📁 Test Script Resolution:`);
console.log(`  Project root: ${testProjectRoot}`);
console.log(`  .env path: ${testEnvPath}`);
console.log(`  .env exists: ${fs.existsSync(testEnvPath)}`);

// Test 2: Server.js path (src -> project root)
const serverDirSimulation = path.join(__dirname, 'src');
const serverProjectRoot = path.resolve(serverDirSimulation, '../');
const serverEnvPath = path.join(serverProjectRoot, '.env');
console.log(`\n🖥️  Server.js Resolution:`);
console.log(`  Server __dirname (simulated): ${serverDirSimulation}`);
console.log(`  Project root: ${serverProjectRoot}`);
console.log(`  .env path: ${serverEnvPath}`);
console.log(`  .env exists: ${fs.existsSync(serverEnvPath)}`);

// Test 3: EbayCompliance.js path (src/api/routes -> project root)
const ebayDirSimulation = path.join(__dirname, 'src', 'api', 'routes');
const ebayProjectRoot = path.resolve(ebayDirSimulation, '../../../');
const ebayEnvPath = path.join(ebayProjectRoot, '.env');
console.log(`\n🔧 EbayCompliance.js Resolution:`);
console.log(`  EbayCompliance __dirname (simulated): ${ebayDirSimulation}`);
console.log(`  Project root: ${ebayProjectRoot}`);
console.log(`  .env path: ${ebayEnvPath}`);
console.log(`  .env exists: ${fs.existsSync(ebayEnvPath)}`);

// Test 4: Check if all paths resolve to same location
console.log(`\n✅ Path Consistency Check:`);
console.log(`  Test = Server: ${testProjectRoot === serverProjectRoot}`);
console.log(`  Test = EbayCompliance: ${testProjectRoot === ebayProjectRoot}`);
console.log(`  Server = EbayCompliance: ${serverProjectRoot === ebayProjectRoot}`);

if (fs.existsSync(testEnvPath)) {
    const envContent = fs.readFileSync(testEnvPath, 'utf8');
    const ebayEndpointLine = envContent.split('\n').find(line => line.startsWith('EBAY_ENDPOINT_URL'));
    console.log(`\n📄 .env content check:`);
    console.log(`  ${ebayEndpointLine || 'EBAY_ENDPOINT_URL not found'}`);
}
