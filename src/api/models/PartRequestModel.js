// models/PartRequestModel.js
import { Schema, model } from 'mongoose';

const partRequestSchema = new Schema({
  // Vehicle Information
  vin: {
    type: String,
    required: true,
    length: 17,
    trim: true,
    uppercase: true
  },
  vehicleInfo: {
    year: {
      type: Number,
      required: true,
      min: 1900,
      max: new Date().getFullYear() + 1
    },
    make: {
      type: String,
      required: true,
      trim: true
    },
    model: {
      type: String,
      required: true,
      trim: true
    },
    trim: String,
    engineSize: String
  },
  
  // Part Information
  partDetails: {
    system: {
      type: String,
      required: true,
      trim: true,
      enum: [
        'Interior',
        'Exterior',
        'Electrical',
        'Steering/Suspension',
        'Engine/Accessories',
        'Transmission/Drivetrain',
        'Wheels/Tires',
        'Other'
      ]
    },
    component: {
      type: String,
      required: true,
      trim: true
    },
    otherComponent: {
      type: String,
      trim: true
    },
    additionalInfo: {
      type: String,
      trim: true
    }
  },

  // Customer Information
  customerInfo: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    }
  },

  // Request Status
  status: {
    type: String,
    enum: ['pending', 'processing', 'quoted', 'fulfilled', 'cancelled'],
    default: 'pending'
  },
  
  quotedPrice: {
    type: Number,
    min: 0
  },
  notes: [{
    content: String,
    author: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Add database indexes for performance
partRequestSchema.index({ status: 1, createdAt: -1 }); // Filter by status, sort by date
partRequestSchema.index({ 'vehicleInfo.make': 1, 'vehicleInfo.model': 1, 'vehicleInfo.year': 1 }); // Vehicle searches
partRequestSchema.index({ 'partDetails.system': 1, 'partDetails.component': 1 }); // Part searches
partRequestSchema.index({ 'customerInfo.email': 1 }); // Customer email lookups
partRequestSchema.index({ 'customerInfo.phone': 1 }); // Customer phone lookups
partRequestSchema.index({ vin: 1 }); // VIN lookups
partRequestSchema.index({ createdAt: -1 }); // Recent requests first

// Add logging middleware
partRequestSchema.pre('save', function(next) {
  console.log('Saving part request:', this.toObject());
  next();
});

partRequestSchema.pre('findOneAndUpdate', function() {
  console.log('Update query:', this.getQuery());
  console.log('Update operations:', this.getUpdate());
});

export const PartRequest = model('PartRequest', partRequestSchema, 'part_requests');