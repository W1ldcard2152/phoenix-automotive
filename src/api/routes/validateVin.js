// src/api/routes/validateVin.js
import { Router } from 'express';
import { DismantledVehicle } from '../models/DismantledVehicleModel.js';
import { RetailVehicle } from '../models/RetailVehicleModel.js';

const router = Router();

/**
 * Extract a specific value from NHTSA API results
 * @param {Array} results - The Results array from NHTSA API response
 * @param {String} variableName - The variable name to search for
 * @returns {String} The extracted value or empty string if not found
 */
function extractValue(results, variableName) {
  const item = results.find(item => item.Variable === variableName);
  return item?.Value || '';
}

/**
 * Route to validate a VIN against our database
 * Checks both dismantled and retail inventories
 */
router.post('/validate', async (req, res) => {
  try {
    const { vin, vehicleInfo } = req.body;

    if (!vin) {
      return res.status(400).json({
        error: 'VIN is required'
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

/**
 * Route to directly decode a VIN through our server
 * Can be used as a proxy to NHTSA API
 */
router.post('/direct-decode', async (req, res) => {
  try {
    const { vin } = req.body;

    if (!vin) {
      return res.status(400).json({
        error: 'VIN is required'
      });
    }

    console.log(`Making direct API call for VIN ${vin}`);
    const nhtsaUrl = `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`;
    
    const response = await fetch(nhtsaUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Phoenix-Automotive-App/1.0'
      }
    });
    
    if (!response.ok) {
      return res.status(response.status).json({
        error: `NHTSA API error: ${response.status}`,
        message: `Failed to decode VIN: ${response.statusText}`
      });
    }
    
    const data = await response.json();
    
    // Extract relevant fields from NHTSA response
    const vehicleInfo = {
      vin: vin,
      year: extractValue(data.Results, "Model Year"),
      make: extractValue(data.Results, "Make"),
      model: extractValue(data.Results, "Model"),
      trim: extractValue(data.Results, "Trim"),
      engineSize: extractValue(data.Results, "Displacement (L)"),
      engineCylinders: extractValue(data.Results, "Engine Number of Cylinders"),
      transmissionType: extractValue(data.Results, "Transmission Style"),
      driveType: extractValue(data.Results, "Drive Type")
    };

    // Include both the full API response and our extracted vehicleInfo
    res.json({
      vehicleInfo,
      rawData: data
    });

  } catch (error) {
    console.error('VIN Decode Error:', error);
    res.status(500).json({
      error: 'Failed to decode VIN',
      details: error.message
    });
  }
});

/**
 * Legacy NHTSA proxy route - maintained for backwards compatibility
 * Proxies requests to NHTSA API with minimal transformation
 */
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
    
    // Add proper timeout and error handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      const response = await fetch(nhtsaUrl, {
        signal: controller.signal,
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Phoenix-Automotive-App/1.0'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`NHTSA API responded with status: ${response.status}`);
      }
      
      // Forward the response directly
      const data = await response.json();
      return res.json(data);
      
    } catch (fetchError) {
      // Handle timeout errors specifically
      if (fetchError.name === 'AbortError') {
        return res.status(504).json({
          error: 'Request timeout',
          message: 'The NHTSA API took too long to respond'
        });
      }
      
      throw fetchError;
    }
  } catch (error) {
    console.error('VIN Decode Proxy Error:', error);
    return res.status(500).json({
      error: 'Failed to decode VIN',
      details: error.message
    });
  }
});

/**
 * Add a new endpoint to test the NHTSA connection directly
 * Used for debugging API connectivity issues
 */
router.get('/test-connection', async (req, res) => {
  try {
    // Test VIN for a 2010 Toyota Camry
    const testVin = '4T1BF3EK7AU115252';
    const nhtsaUrl = `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${testVin}?format=json`;
    
    console.log('Testing NHTSA API connection...');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(nhtsaUrl, {
      signal: controller.signal,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Phoenix-Automotive-App/1.0'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`API test failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Check if the response contains expected fields
    const isValidResponse = data.Results && 
                           Array.isArray(data.Results) && 
                           data.Results.some(item => item.Variable === "Make");
    
    if (!isValidResponse) {
      throw new Error('API response does not match expected format');
    }
    
    // Return connection test results
    return res.json({
      success: true,
      message: 'NHTSA API connection successful',
      apiStatus: 'operational',
      testVin,
      responsePreview: {
        make: extractValue(data.Results, "Make"),
        model: extractValue(data.Results, "Model"),
        year: extractValue(data.Results, "Model Year")
      }
    });
  } catch (error) {
    console.error('API Connection Test Error:', error);
    return res.status(500).json({
      success: false,
      message: 'NHTSA API connection failed',
      error: error.message
    });
  }
});

export default router;