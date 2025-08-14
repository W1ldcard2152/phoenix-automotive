// src/api/routes/DismantledVehicles.js
import { Router } from 'express';
import mongoose from 'mongoose';
import * as DismantledVehicleModel from '../models/DismantledVehicleModel.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

const formatErrorResponse = (error) => {
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return `A dismantled vehicle with this ${field} already exists`;
  }
  return error.message || 'Internal server error';
};

// Get all dismantled vehicles - Public route
router.get('/', async (req, res) => {
  try {
    console.log('Attempting to fetch vehicles...');
    
    // Check database connection
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database connection is not ready');
    }
    
    const { status, dateFrom, dateTo, make, model, year, page = 1, limit = 20 } = req.query;
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

    // Pagination logic
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit))); // Max 100 per page
    const skip = (pageNum - 1) * limitNum;

    console.log('Executing query:', JSON.stringify(query), `Page: ${pageNum}, Limit: ${limitNum}`);

    // Get total count for pagination metadata
    const totalCount = await DismantledVehicleModel.DismantledVehicle.countDocuments(query);
    
    const vehicles = await DismantledVehicleModel.DismantledVehicle.find(query)
      .sort({ dateAcquired: -1 })
      .limit(limitNum)
      .skip(skip)
      .lean()
      .exec();
      
    console.log(`Successfully fetched ${vehicles.length} of ${totalCount} vehicles`);
    
    res.json({
      data: vehicles,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        totalCount,
        hasNextPage: skip + vehicles.length < totalCount,
        hasPrevPage: pageNum > 1
      }
    });
    
  } catch (error) {
    console.error('Error fetching vehicles:', {
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

// Create dismantled vehicle - Protected route
router.post('/', authenticateToken, async (req, res) => {
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

// Get single dismantled vehicle - Public route
router.get('/:id', async (req, res) => {
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

// Update dismantled vehicle - Protected route
router.put('/:id', authenticateToken, async (req, res) => {
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

// Update dismantled vehicle status - Protected route
router.patch('/:id/status', authenticateToken, async (req, res) => {
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

// Delete dismantled vehicle - Protected route
router.delete('/:id', authenticateToken, async (req, res) => {
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