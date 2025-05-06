// src/api/routes/VehicleData.js
import { Router } from 'express';
import { DismantledVehicle } from '../models/DismantledVehicleModel.js';
import { RetailVehicle } from '../models/RetailVehicleModel.js';

const router = Router();

// Improved in-memory cache with automatic cleanup
const cache = {
  data: {},
  set: function(key, value, ttl = 60000) {
    // Clean up previous entry if it exists
    if (this.data[key] && this.data[key].timeoutId) {
      clearTimeout(this.data[key].timeoutId);
    }
    
    // Set up automatic cleanup to prevent memory leaks
    const timeoutId = setTimeout(() => {
      if (this.data[key]) {
        delete this.data[key];
        console.log(`Cache entry expired and cleaned up: ${key}`);
      }
    }, ttl + 1000);
    
    // Store the data with expiry information and timeout reference
    this.data[key] = {
      value,
      expiry: Date.now() + ttl,
      timeoutId
    };
    
    console.log(`Cache set: ${key}, expires in ${ttl/1000}s`);
  },
  
  get: function(key) {
    const item = this.data[key];
    if (!item) {
      console.log(`Cache miss: ${key}`);
      return null;
    }
    
    if (Date.now() > item.expiry) {
      // Clean up expired item
      clearTimeout(item.timeoutId);
      delete this.data[key];
      console.log(`Cache expired: ${key}`);
      return null;
    }
    
    console.log(`Cache hit: ${key}, expires in ${Math.round((item.expiry - Date.now())/1000)}s`);
    return item.value;
  },
  
  clear: function() {
    // Properly clear all timeouts before deleting data
    Object.values(this.data).forEach(item => {
      if (item.timeoutId) {
        clearTimeout(item.timeoutId);
      }
    });
    
    this.data = {};
    console.log('Cache cleared completely');
  },
  
  // Get cache stats for monitoring
  stats: function() {
    const now = Date.now();
    const entries = Object.keys(this.data).length;
    const expired = Object.values(this.data).filter(item => now > item.expiry).length;
    const active = entries - expired;
    
    return {
      totalEntries: entries,
      activeEntries: active,
      expiredEntries: expired,
      keys: Object.keys(this.data)
    };
  }
};

// Helper function for fetch with timeout
const fetchWithTimeout = async (url, options = {}, timeout = 10000) => {
  const controller = new AbortController();
  const { signal } = controller;
  
  const timeoutId = setTimeout(() => {
    controller.abort();
    console.log(`Fetch timeout after ${timeout}ms: ${url}`);
  }, timeout);
  
  try {
    const response = await fetch(url, { ...options, signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeout}ms`);
    }
    throw error;
  }
};

// Batched vehicle data endpoint with improved error handling and caching
router.get('/batched', async (req, res) => {
  try {
    // Get cache key with optional query parameters
    const { status, make, model } = req.query;
    const cacheKeySuffix = status ? `-${status}` : '';
    const cacheKey = `batched-vehicles${cacheKeySuffix}`;
    
    // Try to get from cache first
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      // Add cache header to response
      res.set('X-Cache', 'HIT');
      return res.json(cachedData);
    }
    
    // Set headers to indicate cache miss
    res.set('X-Cache', 'MISS');
    
    console.log('Fetching batched vehicle data from database with params:', req.query);
    
    // Build query based on request parameters
    let dismantledQuery = {};
    let retailQuery = {};
    
    if (status) {
      dismantledQuery.status = status;
      retailQuery.status = status;
    }
    
    if (make) {
      const makeRegex = new RegExp(make, 'i');
      dismantledQuery.make = makeRegex;
      retailQuery.make = makeRegex;
    }
    
    if (model) {
      const modelRegex = new RegExp(model, 'i');
      dismantledQuery.model = modelRegex;
      retailQuery.model = modelRegex;
    }
    
    // Fetch multiple collections in parallel with lean() and timeout for faster processing
    const [dismantledVehicles, retailVehicles] = await Promise.all([
      DismantledVehicle.find(dismantledQuery).lean().exec()
        .then(data => data || [])
        .catch(err => {
          console.error('Error fetching dismantled vehicles:', err);
          return []; // Return empty array on error to avoid breaking the whole response
        }),
      RetailVehicle.find(retailQuery).lean().exec()
        .then(data => data || [])
        .catch(err => {
          console.error('Error fetching retail vehicles:', err);
          return []; // Return empty array on error to avoid breaking the whole response
        })
    ]);
    
    // Prepare result
    const result = {
      timestamp: new Date().toISOString(),
      dismantledVehicles,
      retailVehicles,
      counts: {
        dismantled: dismantledVehicles.length,
        retail: retailVehicles.length,
        total: dismantledVehicles.length + retailVehicles.length
      }
    };
    
    // Cache for 30 seconds - keep this short to ensure fresh data
    cache.set(cacheKey, result, 30000);
    
    // Add cache control headers
    res.set('Cache-Control', 'public, max-age=30');
    
    res.json(result);
  } catch (error) {
    console.error('Batched vehicle data error:', error);
    
    // Try to serve stale cache if available on error
    const staleData = cache.data['batched-vehicles']?.value;
    if (staleData) {
      console.log('Serving stale cache data due to error');
      res.set('X-Cache', 'STALE');
      return res.json(staleData);
    }
    
    res.status(500).json({ 
      error: 'Failed to fetch vehicle data',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get cache stats - admin endpoint
router.get('/cache-stats', (req, res) => {
  res.json(cache.stats());
});

// Clear cache endpoint (for admin use)
router.post('/clear-cache', (req, res) => {
  cache.clear();
  res.json({ 
    success: true, 
    message: 'Cache cleared',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    cache: {
      entries: Object.keys(cache.data).length
    }
  });
});

export default router;