// src/api/routes/VehicleData.js
import { Router } from 'express';
import { DismantledVehicle } from '../models/DismantledVehicleModel.js';
import { RetailVehicle } from '../models/RetailVehicleModel.js';

const router = Router();

// Simple in-memory cache
const cache = {
  data: {},
  set: function(key, value, ttl = 60000) {
    this.data[key] = {
      value,
      expiry: Date.now() + ttl
    };
  },
  get: function(key) {
    const item = this.data[key];
    if (!item) return null;
    if (Date.now() > item.expiry) {
      delete this.data[key];
      return null;
    }
    return item.value;
  },
  clear: function() {
    this.data = {};
  }
};

// Batched vehicle data endpoint
router.get('/batched', async (req, res) => {
  try {
    const cacheKey = 'batched-vehicles';
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      console.log('Serving vehicles from cache');
      return res.json(cachedData);
    }
    
    console.log('Fetching batched vehicle data from database');
    
    // Fetch multiple collections in parallel with lean() for faster processing
    const [dismantledVehicles, retailVehicles] = await Promise.all([
      DismantledVehicle.find().lean().exec(),
      RetailVehicle.find().lean().exec()
    ]);
    
    const result = {
      dismantledVehicles,
      retailVehicles
    };
    
    // Cache for 30 seconds
    cache.set(cacheKey, result, 30000);
    
    res.json(result);
  } catch (error) {
    console.error('Batched vehicle data error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch vehicle data',
      message: error.message 
    });
  }
});

// Clear cache endpoint (for admin use)
router.post('/clear-cache', (req, res) => {
  cache.clear();
  res.json({ success: true, message: 'Cache cleared' });
});

export default router;