import { Router } from 'express';
import * as DismantledVehicleModel from '../models/DismantledVehicleModel.js';

const router = Router();

const formatErrorResponse = (error) => {
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return `A dismantled vehicle with this ${field} already exists`;
  }
  return error.message || 'Internal server error';
};

// Create dismantled vehicle
router.post('/', async (req, res) => {
  try {
    const requiredFields = ['stockNumber', 'make', 'model', 'year', 'vin', 'mileage'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    if (req.body.vin?.length !== 17) {
      return res.status(400).json({
        error: 'VIN must be exactly 17 characters'
      });
    }

    const vehicle = new DismantledVehicleModel.DismantledVehicle(req.body);
    await vehicle.save();
    res.status(201).json(vehicle);
  } catch (error) {
    res.status(400).json({ error: formatErrorResponse(error) });
  }
});

// Get all dismantled vehicles
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

    const vehicles = await DismantledVehicleModel.DismantledVehicle.find(query)
      .sort({ dateAcquired: -1 });
      
    console.log('Successfully fetched vehicles:', vehicles.length);
    res.json(vehicles);
    
  } catch (error) {
    console.error('Error in GET /vehicles:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single dismantled vehicle
router.get('/:id', async (req, res) => {  // Note the /:id parameter
  try {
    const vehicle = await DismantledVehicleModel.DismantledVehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ error: 'Dismantled vehicle not found' });
    }
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ error: formatErrorResponse(error) });
  }
});

// Update dismantled vehicle
router.put('/:id', async (req, res) => {
  try {
    if (req.body.vin && req.body.vin.length !== 17) {
      return res.status(400).json({ error: 'VIN must be exactly 17 characters' });
    }

    const updates = { ...req.body };
    Object.keys(updates).forEach(key => {
      if (updates[key] === undefined || updates[key] === null) {
        delete updates[key];
      }
    });

    const vehicle = await DismantledVehicleModel.DismantledVehicle.findByIdAndUpdate(
      req.params.id,
      updates,
      { 
        new: true,
        runValidators: true,
        context: 'query'
      }
    );

    if (!vehicle) {
      return res.status(404).json({ error: 'Dismantled vehicle not found' });
    }

    res.json(vehicle);
  } catch (error) {
    res.status(400).json({ error: formatErrorResponse(error) });
  }
});

// Update dismantled vehicle status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Awaiting Dismantle', 'Parts Available', 'Scrapped'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const vehicle = await DismantledVehicleModel.DismantledVehicle.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!vehicle) {
      return res.status(404).json({ error: 'Dismantled vehicle not found' });
    }

    res.json(vehicle);
  } catch (error) {
    res.status(400).json({ error: formatErrorResponse(error) });
  }
});

// Delete dismantled vehicle
router.delete('/:id', async (req, res) => {
  try {
    const vehicle = await DismantledVehicleModel.DismantledVehicle.findByIdAndDelete(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({ error: 'Dismantled vehicle not found' });
    }

    res.json({
      message: 'Dismantled vehicle deleted successfully',
      vehicle
    });
  } catch (error) {
    res.status(500).json({ error: formatErrorResponse(error) });
  }
});

export default router;