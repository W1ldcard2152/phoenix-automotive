import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../..');

// Load environment variables if not already loaded
dotenv.config({ path: path.join(projectRoot, '.env') });

// Verify required MongoDB environment variables
const requiredEnvVars = [
  'MONGODB_USER',
  'MONGODB_PASSWORD',
  'MONGODB_CLUSTER',
  'MONGODB_OPTIONS'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('Missing required MongoDB environment variables:', missingEnvVars);
  process.exit(1);
}

const DATABASE_NAME = process.env.MONGODB_DATABASE || 'phoenix_automotive';

// Construct the connection string
const MONGODB_URI = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_CLUSTER}/${DATABASE_NAME}?${process.env.MONGODB_OPTIONS}`;

const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    
    const conn = await mongoose.connect(MONGODB_URI, {
      // These options are no longer needed in newer versions of Mongoose
      // but included for compatibility
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('MongoDB Connection Info:', {
      host: conn.connection.host,
      database: conn.connection.name,
      port: conn.connection.port || 'default',
      status: conn.connection.readyState === 1 ? 'connected' : 'not connected'
    });

    mongoose.connection.on('error', err => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    throw error;
  }
};

export default connectDB;