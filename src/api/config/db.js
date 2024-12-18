import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MongoDB URI is not defined in environment variables');
    }

    console.log('Attempting to connect to MongoDB...');
    console.log(`Using database: ${mongoUri.split('@')[1]}`); // Logs the URI without credentials

    const conn = await mongoose.connect(mongoUri, {
      // These options are no longer needed in newer versions of mongoose but won't hurt
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    // Log additional details that might be helpful
    console.error('Error details:', {
      name: error.name,
      code: error.code,
      codeName: error.codeName,
    });
    
    // Exit process with failure if this is a critical error
    process.exit(1);
  }
};

export default connectDB;