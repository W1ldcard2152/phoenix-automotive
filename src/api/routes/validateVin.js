import { Router } from 'express';
import { DismantledVehicle } from '../models/DismantledVehicleModel.js';
import { RetailVehicle } from '../models/RetailVehicleModel.js';

const router = Router();

router.post('/validate', async (req, res) => {
  try {
    const { vin, vehicleInfo } = req.body;

    if (!vin || !vehicleInfo) {
      return res.status(400).json({
        error: 'Missing required information'
      });
    }

    // Check both dismantled and retail inventories
    const [dismantledMatch, retailMatch] = await Promise.all([
      DismantledVehicle.findOne({ vin: vin.toUpperCase() }),
      RetailVehicle.findOne({ vin: vin.toUpperCase() })
    ]);

    // If we find a match in either inventory
    if (dismantledMatch || retailMatch) {
      const match = dismantledMatch || retailMatch;
      return res.json({
        inInventory: true,
        inventoryId: match._id,
        inventoryType: dismantledMatch ? 'dismantled' : 'retail',
        vehicleInfo: {
          ...vehicleInfo,
          stockNumber: match.stockNumber,
        }
      });
    }

    // If no match is found, still return success but with inInventory: false
    return res.json({
      inInventory: false,
      vehicleInfo
    });

  } catch (error) {
    console.error('VIN Validation Error:', error);
    res.status(500).json({
      error: 'Failed to validate VIN',
      details: error.message
    });
  }
});

router.post('/decode', async (req, res) => {
  try {
    const { vin } = req.body;

    if (!vin) {
      return res.status(400).json({
        error: 'VIN is required'
      });
    }

    const response = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`
    );

    if (!response.ok) {
      throw new Error('Failed to decode VIN with NHTSA');
    }

    const data = await response.json();
    
    // Extract relevant fields from NHTSA response
    const vehicleInfo = {
      vin: vin,
      year: data.Results.find(item => item.Variable === "Model Year")?.Value,
      make: data.Results.find(item => item.Variable === "Make")?.Value,
      model: data.Results.find(item => item.Variable === "Model")?.Value,
      trim: data.Results.find(item => item.Variable === "Trim")?.Value,
      engineSize: data.Results.find(item => item.Variable === "Displacement (L)")?.Value,
      engineCylinders: data.Results.find(item => item.Variable === "Engine Number of Cylinders")?.Value,
      transmissionType: data.Results.find(item => item.Variable === "Transmission Style")?.Value,
      driveType: data.Results.find(item => item.Variable === "Drive Type")?.Value,
    };

    res.json(vehicleInfo);

  } catch (error) {
    console.error('VIN Decode Error:', error);
    res.status(500).json({
      error: 'Failed to decode VIN',
      details: error.message
    });
  }
});

// Proxy route to NHTSA API
// Updated proxy route in src/api/routes/validateVin.js
router.get('/nhtsa/:vin', async (req, res) => {
  try {
    const { vin } = req.params;
    
    if (!vin || vin.length !== 17) {
      return res.status(400).json({
        error: 'Valid 17-character VIN is required'
      });
    }
    
    const nhtsaUrl = `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`;
    console.log(`Proxying VIN decode request to NHTSA API: ${nhtsaUrl}`);
    
    try {
      const response = await fetch(nhtsaUrl, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Phoenix-Automotive-App/1.0'
        },
        timeout: 15000 // 15 second timeout
      });
      
      if (!response.ok) {
        console.error(`NHTSA API responded with status: ${response.status}, statusText: ${response.statusText}`);
        return res.status(response.status).json({
          error: `NHTSA API error: ${response.status}`,
          message: `Failed to decode VIN: ${response.statusText}`
        });
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error(`Unexpected content type from NHTSA API: ${contentType}`);
        return res.status(500).json({
          error: 'Invalid response from NHTSA API',
          message: `Expected JSON but got: ${contentType}`
        });
      }
      
      const data = await response.json();
      console.log('Successfully proxied NHTSA API response');
      return res.json(data);
      
    } catch (fetchError) {
      console.error('Error fetching from NHTSA API:', fetchError);
      return res.status(500).json({
        error: 'Failed to fetch from NHTSA API',
        message: fetchError.message,
        code: 'FETCH_ERROR'
      });
    }
  } catch (error) {
    console.error('VIN Decode Proxy Error:', error);
    return res.status(500).json({
      error: 'Failed to decode VIN',
      details: error.message,
      code: 'PROXY_ERROR'
    });
  }
});

export default router;