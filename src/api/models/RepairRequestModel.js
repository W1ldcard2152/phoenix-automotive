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
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    address: {
      street: {
        type: String,
        trim: true
      },
      city: {
        type: String,
        trim: true
      },
      state: {
        type: String,
        trim: true
      },
      zipCode: {
        type: String,
        trim: true
      }
    }
  },
  
  // Vehicle Information
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
    vin: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      length: 17
    },
    mileage: {
      type: Number,
      required: true,
      min: 0
    },
    engineSize: String
  },
  
  // Service Information
  serviceInfo: {
    serviceType: {
      type: String,
      required: true,
      enum: [
        'Diagnostic',
        'Engine Repair',
        'Transmission Repair',
        'Brake Service',
        'Suspension Work',
        'Electrical Repair',
        'AC/Heating Service',
        'Scheduled Maintenance',
        'State Inspection',
        'Other'
      ]
    },
    otherServiceType: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    preferredDate: {
      type: Date
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
    enum: ['pending', 'scheduled', 'in_progress', 'completed', 'cancelled'],
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
  }]
}, {
  timestamps: true
});

// Add logging middleware
repairRequestSchema.pre('save', function(next) {
  console.log('Saving repair request:', this.toObject());
  next();
});

repairRequestSchema.pre('findOneAndUpdate', function() {
  console.log('Update query:', this.getQuery());
  console.log('Update operations:', this.getUpdate());
});

export const RepairRequest = model('RepairRequest', repairRequestSchema, 'repair_requests');