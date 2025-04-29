// scripts/checkEnv.js
// A utility script to check and verify the environment variables

console.log('Checking environment variables...');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('CLIENT_URL:', process.env.CLIENT_URL);
console.log('PORT:', process.env.PORT);

// Check MongoDB connection vars (sanitized)
console.log('MONGODB_USER:', process.env.MONGODB_USER ? 'Set' : 'Not set');
console.log('MONGODB_PASSWORD:', process.env.MONGODB_PASSWORD ? 'Set' : 'Not set');
console.log('MONGODB_CLUSTER:', process.env.MONGODB_CLUSTER ? 'Set' : 'Not set');
console.log('MONGODB_OPTIONS:', process.env.MONGODB_OPTIONS ? 'Set' : 'Not set');

// Check critical paths
console.log('__dirname:', __dirname);
console.log('Current working directory:', process.cwd());

// If running in production, check dist directory
if (process.env.NODE_ENV === 'production') {
  const fs = require('fs');
  const path = require('path');
  
  const distPath = path.join(process.cwd(), 'dist');
  console.log('Checking dist directory:', distPath);
  
  try {
    if (fs.existsSync(distPath)) {
      console.log('dist directory exists');
      
      // Check for index.html
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        console.log('index.html exists');
      } else {
        console.error('ERROR: index.html missing!');
      }
      
      // Check for assets directory
      const assetsPath = path.join(distPath, 'assets');
      if (fs.existsSync(assetsPath)) {
        console.log('assets directory exists');
        
        // List a few asset files
        const files = fs.readdirSync(assetsPath);
        console.log('First 5 asset files:', files.slice(0, 5));
      } else {
        console.error('ERROR: assets directory missing!');
      }
    } else {
      console.error('ERROR: dist directory does not exist!');
    }
  } catch (error) {
    console.error('Error checking dist directory:', error);
  }
}

console.log('Environment check complete!');
