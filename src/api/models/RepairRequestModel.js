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
      required: false,
      trim: true,
      uppercase: true,
      validate: {
        validator: function(v) {
          // Only validate length if VIN is provided
          return !v || v.length === 17;
        },
        message: 'VIN must be exactly 17 characters if provided'
      }
    },
    mileage: {
      type: Number,
      required: false,
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
        'General Repair',
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

repairRequestSchema.pre('findOneAndUpdate', function() {
  console.log('Update query:', this.getQuery());
  console.log('Update operations:', this.getUpdate());
});

export const RepairRequest = model('RepairRequest', repairRequestSchema, 'repair_requests');