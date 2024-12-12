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

export default router;