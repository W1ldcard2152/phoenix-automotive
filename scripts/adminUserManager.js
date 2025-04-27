// scripts/adminUserManager.js
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

// Get MongoDB connection details
const DATABASE_NAME = process.env.MONGODB_DATABASE || 'phoenix_automotive';

// Construct the connection string
const MONGODB_URI = process.env.MONGODB_URI || 
  `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_CLUSTER}/${DATABASE_NAME}?${process.env.MONGODB_OPTIONS}` || 
  'mongodb://localhost:27017/phoenix_automotive';

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to ask questions
const question = (query) => new Promise((resolve) => rl.question(query, resolve));

// Password validation function
const validatePassword = (password) => {
  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  
  const hasNumber = /\d/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  if (!(hasNumber && hasUpper && hasLower && hasSpecial)) {
    return 'Password must contain at least: one number, one uppercase letter, one lowercase letter, and one special character';
  }
  
  return null; // No error
};

// Function to add a new admin user
async function addUser() {
  try {
    console.log('\n--- Add New Admin User ---');
    
    const username = await question('Enter username: ');
    
    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      console.error(`User ${username} already exists`);
      return mainMenu();
    }
    
    let password;
    let passwordError;
    
    do {
      password = await question('Enter password: ');
      passwordError = validatePassword(password);
      
      if (passwordError) {
        console.error(passwordError);
      }
    } while (passwordError);
    
    const role = await question('Enter role (admin/editor) [admin]: ') || 'admin';
    
    if (!['admin', 'editor'].includes(role)) {
      console.error('Invalid role. Must be "admin" or "editor"');
      return mainMenu();
    }
    
    // Create user
    const user = new User({
      username,
      password,
      role
    });
    
    await user.save();
    console.log(`User ${username} created successfully with role ${role}`);
    
  } catch (error) {
    console.error('Error creating user:', error);
  }
  
  await mainMenu();
}

// Function to list all users
async function listUsers() {
  try {
    console.log('\n--- All Users ---');
    
    const users = await User.find({}).select('-password');
    
    if (users.length === 0) {
      console.log('No users found');
      return mainMenu();
    }
    
    console.log('ID | Username | Role | Active | Last Login');
    console.log('-'.repeat(60));
    
    users.forEach(user => {
      const lastLogin = user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never';
      console.log(`${user._id} | ${user.username} | ${user.role} | ${user.active ? 'Yes' : 'No'} | ${lastLogin}`);
    });
    
  } catch (error) {
    console.error('Error listing users:', error);
  }
  
  await mainMenu();
}

// Function to reset a user's password
async function resetPassword() {
  try {
    console.log('\n--- Reset User Password ---');
    
    const username = await question('Enter username: ');
    
    // Check if user exists
    const user = await User.findOne({ username });
    if (!user) {
      console.error(`User ${username} not found`);
      return mainMenu();
    }
    
    let password;
    let passwordError;
    
    do {
      password = await question('Enter new password: ');
      passwordError = validatePassword(password);
      
      if (passwordError) {
        console.error(passwordError);
      }
    } while (passwordError);
    
    // Update password
    user.password = password;
    user.passwordLastChanged = new Date();
    user.tokenVersion = (user.tokenVersion || 0) + 1; // Invalidate tokens
    
    await user.save();
    console.log(`Password for ${username} reset successfully`);
    
  } catch (error) {
    console.error('Error resetting password:', error);
  }
  
  await mainMenu();
}

// Function to enable/disable a user
async function toggleUserStatus() {
  try {
    console.log('\n--- Enable/Disable User ---');
    
    const username = await question('Enter username: ');
    
    // Check if user exists
    const user = await User.findOne({ username });
    if (!user) {
      console.error(`User ${username} not found`);
      return mainMenu();
    }
    
    const currentStatus = user.active ? 'enabled' : 'disabled';
    const toggleTo = !user.active;
    
    const confirm = await question(`User ${username} is currently ${currentStatus}. ${toggleTo ? 'Enable' : 'Disable'} user? (y/n): `);
    
    if (confirm.toLowerCase() !== 'y') {
      console.log('Operation cancelled');
      return mainMenu();
    }
    
    // Update status
    user.active = toggleTo;
    
    if (!toggleTo) {
      // If disabling, also invalidate tokens
      user.tokenVersion = (user.tokenVersion || 0) + 1;
    }
    
    await user.save();
    console.log(`User ${username} ${toggleTo ? 'enabled' : 'disabled'} successfully`);
    
  } catch (error) {
    console.error('Error toggling user status:', error);
  }
  
  await mainMenu();
}

// Main menu function
async function mainMenu() {
  console.log('\n--- Admin User Manager ---');
  console.log('1. List all users');
  console.log('2. Add new admin user');
  console.log('3. Reset user password');
  console.log('4. Enable/disable user');
  console.log('5. Exit');
  
  const choice = await question('\nEnter choice (1-5): ');
  
  switch (choice) {
    case '1':
      await listUsers();
      break;
    case '2':
      await addUser();
      break;
    case '3':
      await resetPassword();
      break;
    case '4':
      await toggleUserStatus();
      break;
    case '5':
      console.log('Exiting...');
      rl.close();
      await mongoose.disconnect();
      process.exit(0);
      break;
    default:
      console.log('Invalid choice');
      await mainMenu();
  }
}

// Main function
async function main() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    await mainMenu();
    
  } catch (error) {
    console.error('Error:', error);
    rl.close();
    process.exit(1);
  }
}

// Start the program
main();
