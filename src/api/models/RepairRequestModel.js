import { Schema, model } from 'mongoose';

const repairRequestSchema = new Schema({
  // Customer Information
  customerInfo: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: false,
      trim: true
    },
    email: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
      validate: {
        validator: function(v) {
          // Only validate email format if email is provided
          return !v || /^\S+@\S+\.\S+$/.test(v);
        },
        message: 'Please enter a valid email address'
      }
    }
  },
  
  // Service Information - Simplified
  serviceInfo: {
    message: {
      type: String,
      required: true,
      trim: true
    },
    urgency: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Emergency'],
      default: 'Medium'
    }
  },
  
  // Request Status
  status: {
    type: String,
    enum: ['pending', 'scheduled', 'in_progress', 'completed', 'cancelled', 'archived'],
    default: 'pending'
  },
  
  // Admin Fields
  estimatedCost: {
    type: Number,
    min: 0
  },
  assignedTechnician: {
    type: String,
    trim: true
  },
  notes: [{
    content: String,
    author: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Archive functionality
  isArchived: {
    type: Boolean,
    default: false
  },
  archivedAt: {
    type: Date
  },
  archivedBy: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Add database indexes for performance
repairRequestSchema.index({ status: 1, createdAt: -1 }); // Filter by status, sort by date
repairRequestSchema.index({ 'customerInfo.name': 1 }); // Customer name searches
repairRequestSchema.index({ 'customerInfo.phone': 1 }); // Phone lookups
repairRequestSchema.index({ 'customerInfo.email': 1 }); // Email lookups
repairRequestSchema.index({ 'serviceInfo.urgency': 1, createdAt: -1 }); // Urgent requests first
repairRequestSchema.index({ createdAt: -1 }); // Recent requests first
repairRequestSchema.index({ isArchived: 1, status: 1 }); // Archived/active filtering

// Add validation to ensure at least one contact method is provided
repairRequestSchema.pre('save', function(next) {
  console.log('Saving repair request:', this.toObject());
  
  // Ensure at least one contact method (phone or email) is provided
  const hasPhone = this.customerInfo.phone && this.customerInfo.phone.trim() !== '';
  const hasEmail = this.customerInfo.email && this.customerInfo.email.trim() !== '';
  
  if (!hasPhone && !hasEmail) {
    const error = new Error('At least one contact method (phone or email) is required');
    error.name = 'ValidationError';
    return next(error);
  }
  
  next();
});

// Archive middleware
repairRequestSchema.methods.archive = function(archivedBy) {
  this.isArchived = true;
  this.archivedAt = new Date();
  this.archivedBy = archivedBy || 'Admin';
  this.status = 'archived';
  return this.save();
};

// Unarchive middleware
repairRequestSchema.methods.unarchive = function() {
  this.isArchived = false;
  this.archivedAt = undefined;
  this.archivedBy = undefined;
  this.status = 'pending';
  return this.save();
};

repairRequestSchema.pre('findOneAndUpdate', function() {
  console.log('Update query:', this.getQuery());
  console.log('Update operations:', this.getUpdate());
});

export const RepairRequest = model('RepairRequest', repairRequestSchema, 'repair_requests');