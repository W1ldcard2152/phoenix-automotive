// scripts/createAdminUser.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { User } from '../src/api/models/UserModel.js';

// Get current directory and project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../');

// Load environment variables
dotenv.config({ path: path.join(projectRoot, '.env') });

// Get MongoDB URI from environment variables
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/phoenix_automotive';

// Default admin credentials - change these as needed
const DEFAULT_USERNAME = 'admin';
const DEFAULT_PASSWORD = 'phoenix@dmin2024'; 

const createAdmin = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Check if admin already exists
    const adminExists = await User.findOne({ username: DEFAULT_USERNAME });
    
    if (adminExists) {
      console.log('Admin user already exists');
      await mongoose.disconnect();
      process.exit(0);
    }
    
    // Create admin user
    console.log('Creating admin user...');
    const admin = new User({
      username: DEFAULT_USERNAME,
      password: DEFAULT_PASSWORD,
      role: 'admin'
    });
    
    await admin.save();
    console.log('Admin user created successfully');
    console.log(`Username: ${DEFAULT_USERNAME}`);
    console.log(`Password: ${DEFAULT_PASSWORD}`);
    console.log('IMPORTANT: Change this password after first login!');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

createAdmin();