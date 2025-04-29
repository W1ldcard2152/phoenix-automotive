// scripts/createAdminUser.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { User } from '../src/api/models/UserModel.js';
import readline from 'readline';

// Get current directory and project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../');

// Load environment variables
dotenv.config({ path: path.join(projectRoot, '.env') });

// Get MongoDB connection details from environment variables
const DATABASE_NAME = process.env.MONGODB_DATABASE || 'phoenix_automotive';

// IMPORTANT: Make sure the database name is explicitly in the connection string
// This ensures we don't connect to the 'test' database by default
let MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  // Construct the connection string with explicit database name
  MONGODB_URI = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_CLUSTER}/${DATABASE_NAME}`;
  
  // Add options if available
  if (process.env.MONGODB_OPTIONS) {
    MONGODB_URI += `?${process.env.MONGODB_OPTIONS}`;
  }
}

// Make sure the database name is definitely in the URI
// This is a safeguard in case the URI is constructed but missing the database name
if (MONGODB_URI.includes('@') && !MONGODB_URI.split('@')[1].includes('/')) {
  MONGODB_URI += `/${DATABASE_NAME}`;
}

// Create readline interface for interactive input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to ask questions via readline
const promptQuestion = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

// Function to validate password strength - simplified!
const validatePassword = (password) => {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  
  return { valid: true };
};

// Function to create or update admin user
const createOrUpdateAdmin = async (username, password) => {
  // Check if user already exists
  const existingUser = await User.findOne({ username });
  
  if (existingUser) {
    console.log(`User '${username}' already exists.`);
    
    // Check if already an admin
    if (existingUser.role === 'admin') {
      console.log(`User '${username}' is already an admin.`);
      return true;
    }
    
    // Update to admin role
    console.log(`Updating user '${username}' to admin role...`);
    existingUser.role = 'admin';
    await existingUser.save();
    console.log(`User '${username}' has been updated to admin role.`);
    return true;
  }
  
  // Create new admin user
  console.log(`Creating new admin user '${username}'...`);
  const newAdmin = new User({
    username,
    password,
    role: 'admin',
    active: true
  });
  
  await newAdmin.save();
  console.log(`Admin user '${username}' created successfully.`);
  return true;
};

// Main function
const createAdmin = async () => {
  let connection = null;
  
  try {
    // Define MongoDB connection options
    const connectionOptions = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 5,
      maxIdleTimeMS: 30000,
      authSource: 'admin',
      retryWrites: true,
      w: 'majority',
      dbName: DATABASE_NAME // Explicitly set database name in connection options
    };
    
    // Display connection attempt (masking password)
    const maskedUri = MONGODB_URI.replace(/(?<=:\/\/[^:]+:)[^@]+(?=@)/, '********');
    console.log('Connecting to MongoDB...');
    console.log(`Connection URI: ${maskedUri}`);
    console.log(`Target database: ${DATABASE_NAME}`);
    
    // Connect to MongoDB
    connection = await mongoose.connect(MONGODB_URI, connectionOptions);
    
    // Double-check we're connected to the right database
    const actualDbName = connection.connection.name;
    console.log(`✓ Connected to MongoDB database: ${actualDbName}`);
    
    if (actualDbName !== DATABASE_NAME) {
      console.warn(`⚠️ Warning: Connected to database '${actualDbName}' instead of '${DATABASE_NAME}'`);
      const proceed = await promptQuestion('Continue anyway? (y/n): ');
      if (proceed.toLowerCase() !== 'y') {
        throw new Error('Admin user creation cancelled due to wrong database');
      }
    }
    
    console.log(`Connection state: ${connection.connection.readyState === 1 ? 'Connected' : 'Not connected'}`);
    
    // Get username input
    let username = await promptQuestion('Enter admin username (default: admin): ');
    username = username.trim() || 'admin';
    
    // Get and validate password
    let password;
    let isValidPassword = false;
    
    while (!isValidPassword) {
      password = await promptQuestion('Enter admin password (min 8 characters): ');
      
      // Validate password
      const validation = validatePassword(password);
      
      if (!validation.valid) {
        console.error(`✗ ${validation.message}`);
        const retry = await promptQuestion('Try again? (y/n): ');
        
        if (retry.toLowerCase() !== 'y') {
          throw new Error('Admin user creation cancelled');
        }
      } else {
        isValidPassword = true;
      }
    }
    
    // Create or update admin user
    const success = await createOrUpdateAdmin(username, password);
    
    if (success) {
      console.log('\n====== ADMIN USER DETAILS ======');
      console.log(`Username: ${username}`);
      console.log('Password: [HIDDEN]');
      console.log('================================');
      console.log('\n✓ Admin user setup complete!');
      console.log('IMPORTANT: For security reasons, change this password after first login!');
    }
  } catch (error) {
    console.error('\n✗ Error creating admin user:');
    
    if (error.name === 'MongoServerSelectionError') {
      console.error('Failed to connect to MongoDB server. Please check:');
      console.error('  - Your MongoDB connection string');
      console.error('  - Network connectivity to MongoDB');
      console.error('  - MongoDB Atlas IP whitelist settings');
    } else if (error.name === 'ValidationError') {
      console.error('User validation failed:');
      Object.keys(error.errors).forEach(key => {
        console.error(`  - ${key}: ${error.errors[key].message}`);
      });
    } else {
      console.error(error.message);
      console.error('Stack trace:', error.stack);
    }
    
    process.exitCode = 1;
  } finally {
    // Always clean up resources
    if (connection) {
      console.log('Closing MongoDB connection...');
      await mongoose.disconnect();
      console.log('✓ MongoDB connection closed');
    }
    
    rl.close();
    
    // Add a brief delay to ensure everything is properly closed
    await new Promise(resolve => setTimeout(resolve, 500));
  }
};

// Execute the script
createAdmin().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});