// src/api/models/UserModel.js
import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8 // Enforce minimum password length
  },
  role: {
    type: String,
    enum: ['admin', 'editor'],
    default: 'admin'
  },
  tokenVersion: {
    type: Number,
    default: 0 // Used for invalidating refresh tokens
  },
  passwordLastChanged: {
    type: Date,
    default: Date.now
  },
  failedLoginAttempts: {
    type: Number,
    default: 0
  },
  lockedUntil: Date,
  lastLogin: Date,
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it's modified or new
  if (!this.isModified('password')) return next();
  
  try {
    // Generate salt
    const salt = await bcrypt.genSalt(10);
    // Hash password
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords with additional security measures
userSchema.methods.comparePassword = async function(candidatePassword) {
  // If account is locked, prevent login attempts
  if (this.lockedUntil && new Date() < this.lockedUntil) {
    throw new Error('Account is temporarily locked. Please try again later.');
  }
  
  // Compare passwords
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  
  // Handle failed login attempts
  if (!isMatch) {
    this.failedLoginAttempts += 1;
    
    // Lock account after 5 failed attempts for 15 minutes
    if (this.failedLoginAttempts >= 5) {
      this.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      console.warn(`Account locked for user: ${this.username} due to multiple failed login attempts`);
    }
    
    await this.save();
    return false;
  }
  
  // Reset failed attempts on successful login
  if (this.failedLoginAttempts > 0) {
    this.failedLoginAttempts = 0;
    this.lockedUntil = undefined;
    await this.save();
  }
  
  return true;
};

// Method to change password
userSchema.methods.changePassword = async function(currentPassword, newPassword) {
  // Verify current password
  const isMatch = await bcrypt.compare(currentPassword, this.password);
  if (!isMatch) {
    throw new Error('Current password is incorrect');
  }
  
  // Set new password
  this.password = newPassword; // Will be hashed by pre-save hook
  this.passwordLastChanged = new Date();
  this.tokenVersion += 1; // Invalidate all existing tokens
  
  return this.save();
};

export const User = model('User', userSchema, 'users');
