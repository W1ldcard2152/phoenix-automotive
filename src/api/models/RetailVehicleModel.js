import { Schema, model } from 'mongoose';

const retailVehicleSchema = new Schema({
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
  price: {
    type: Number,
    required: true,
    min: 0
  },
  mileage: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['available', 'pending', 'sold'],
    default: 'available'
  },
  condition: {
    type: String,
    required: true,
    enum: ['new', 'excellent', 'good', 'fair', 'poor'],
    default: 'good'
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
  fuelType: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  features: [{
    type: String,
    trim: true
  }],
  imageUrl: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

retailVehicleSchema.pre('save', function(next) {
  console.log('Saving retail vehicle:', this.toObject());
  console.log('Initializing RetailVehicle model with collection:', 'retail_vehicles');
  next();
});

retailVehicleSchema.pre('findOneAndUpdate', function() {
  console.log('Update query:', this.getQuery());
  console.log('Update operations:', this.getUpdate());
  console.log('Initializing RetailVehicle model with collection:', 'retail_vehicles');
});

export const RetailVehicle = model('RetailVehicle', retailVehicleSchema, 'retail_vehicles');