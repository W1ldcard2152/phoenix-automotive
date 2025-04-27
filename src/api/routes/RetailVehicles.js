import { Router } from 'express';
import * as RetailVehicleModel from '../models/RetailVehicleModel.js';
import mongoose from 'mongoose';

const router = Router();

// Get all Retail vehicles
router.get('/', async (req, res) => {
  try {
    console.log('Attempting to fetch vehicles...');
    
    const { status, dateFrom, dateTo, make, model, year } = req.query;
    let query = {};

    if (status) query.status = status;
    if (make) query.make = new RegExp(make, 'i');
    if (model) query.model = new RegExp(model, 'i');
    if (year) query.year = parseInt(year);
    
    if (dateFrom || dateTo) {
      query.dateAcquired = {};
      if (dateFrom) query.dateAcquired.$gte = new Date(dateFrom);
      if (dateTo) query.dateAcquired.$lte = new Date(dateTo);
    }

    const vehicles = await RetailVehicleModel.RetailVehicle.find(query)  // Changed from DismantledVehicle to RetailVehicle
      .sort({ dateAcquired: -1 });
      
    console.log('Successfully fetched vehicles:', vehicles.length);
    res.json(vehicles);
    
  } catch (error) {
    console.error('Error in GET /vehicles:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single retail vehicle by ID
router.get('/:id', async (req, res) => {
  try {
    console.log('Attempting to fetch retail vehicle by ID:', req.params.id);
    
    // Check database connection
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database connection is not ready');
    }
    
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid vehicle ID format' });
    }

    const vehicle = await RetailVehicleModel.RetailVehicle.findById(req.params.id);
    
    if (!vehicle) {
      console.log('No vehicle found with ID:', req.params.id);
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    
    console.log('Found vehicle:', vehicle._id);
    res.json(vehicle);
    
  } catch (error) {
    console.error('Error fetching retail vehicle by ID:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    res.status(500).json({ 
      error: error.message,
      code: error.code
    });
  }
});

// Create new retail vehicle
router.post('/', async (req, res, next) => {
  try {
    console.log('Creating new retail vehicle with data:', req.body);
    
    const vehicle = new RetailVehicleModel.RetailVehicle(req.body);
    const savedVehicle = await vehicle.save();
    
    console.log('Vehicle saved successfully:', savedVehicle);
    return res.status(201).json(savedVehicle);
  } catch (error) {
    console.error('Error creating retail vehicle:', error);
    next(error);
  }
});

// Update retail vehicle
router.put('/:id', async (req, res, next) => {
  try {
    console.log('Updating retail vehicle:', req.params.id);
    console.log('Update data:', req.body);

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid vehicle ID format' });
    }

    const vehicle = await RetailVehicleModel.RetailVehicle.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!vehicle) {
      console.log('No vehicle found with ID:', req.params.id);
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    console.log('Vehicle updated successfully:', vehicle);
    return res.json(vehicle);
  } catch (error) {
    console.error('Error updating retail vehicle:', error);
    next(error);
  }
});

// Delete retail vehicle
router.delete('/:id', async (req, res, next) => {
  try {
    console.log('Deleting retail vehicle:', req.params.id);

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid vehicle ID format' });
    }

    const vehicle = await RetailVehicleModel.RetailVehicle.findByIdAndDelete(req.params.id);
    
    if (!vehicle) {
      console.log('No vehicle found with ID:', req.params.id);
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    console.log('Vehicle deleted successfully:', req.params.id);
    return res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    console.error('Error deleting retail vehicle:', error);
    next(error);
  }
});

export default router;