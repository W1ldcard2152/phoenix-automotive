import { Schema, model } from 'mongoose';

const dismantledVehicleSchema = new Schema({
  stockNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
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
  trim: {
    type: String,
    trim: true
  },
  year: {
    type: Number,
    required: true,
    min: 1900,
    max: new Date().getFullYear() + 1
  },
  vin: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    length: 17
  },
  mileage: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['Awaiting Dismantle', 'Parts Available', 'Scrapped'],
    default: 'Awaiting Dismantle'
  },
  dateAcquired: {
    type: Date,
    required: true,
    default: Date.now
  },
  imageUrl: {
    type: String,
    trim: true
  },
  exteriorColor: {
    type: String,
    trim: true
  },
  interiorColor: {
    type: String,
    trim: true
  },
  transmission: {
    type: String,
    trim: true
  },
  engineType: {
    type: String,
    trim: true
  },
  driveType: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Add database indexes for performance
dismantledVehicleSchema.index({ make: 1, model: 1, year: 1 }); // Most common search combination
dismantledVehicleSchema.index({ status: 1, dateAcquired: -1 }); // Filter by status, sort by date
dismantledVehicleSchema.index({ vin: 1 }); // VIN lookups (already unique but explicit index)
dismantledVehicleSchema.index({ stockNumber: 1 }); // Stock number lookups
dismantledVehicleSchema.index({ createdAt: -1 }); // Recent records first
dismantledVehicleSchema.index({ make: 1, year: 1 }); // Make + year searches

dismantledVehicleSchema.pre('save', function(next) {
  console.log('Saving dismantled vehicle:', this.toObject());
  console.log('Initializing DismantledVehicle model with collection:', 'dismantled_vehicles');
  next();
});

dismantledVehicleSchema.pre('findOneAndUpdate', function() {
  console.log('Update query:', this.getQuery());
  console.log('Update operations:', this.getUpdate());
  console.log('Initializing DismantledVehicle model with collection:', 'dismantled_vehicles');
});

export const DismantledVehicle = model('DismantledVehicle', dismantledVehicleSchema, 'dismantled_vehicles');
