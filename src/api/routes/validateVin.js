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

// Enhanced NHTSA API proxy with better error handling and fallbacks
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
      // Add proper timeout and headers
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const response = await fetch(nhtsaUrl, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Phoenix-Automotive-App/1.0'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.error(`NHTSA API responded with status: ${response.status}, statusText: ${response.statusText}`);
        return res.status(response.status).json({
          error: `NHTSA API error: ${response.status}`,
          message: `Failed to decode VIN: ${response.statusText}`
        });
      }
      
      // Get the text first for safer parsing
      const text = await response.text();
      console.log('Raw response length:', text.length);
      console.log('Raw response preview:', text.substring(0, 100));
      
      // Check if we received HTML instead of JSON
      if (text.toLowerCase().includes('<!doctype html>') || text.toLowerCase().includes('<html')) {
        console.error('HTML content detected in NHTSA response');
        return res.status(500).json({
          error: 'Invalid response from NHTSA API',
          message: 'Received HTML instead of JSON'
        });
      }
      
      // Clean up potential BOM character and whitespace
      const cleanedText = text.replace(/^\uFEFF/, '').trim();
      let data;
      
      try {
        data = JSON.parse(cleanedText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError, 'Text:', cleanedText.substring(0, 200));
        return res.status(500).json({
          error: 'Failed to parse NHTSA API response',
          message: parseError.message,
          responsePreview: cleanedText.substring(0, 100) // First 100 chars for debugging
        });
      }
      
      // Check for valid Results array
      if (!data.Results || !Array.isArray(data.Results)) {
        console.error('Missing Results array in NHTSA response');
        return res.status(500).json({
          error: 'Invalid NHTSA API response format',
          message: 'Missing Results array'
        });
      }
      
      console.log('Successfully proxied NHTSA API response');
      return res.json(data);
      
    } catch (fetchError) {
      // Check for timeout or other network errors
      if (fetchError.name === 'AbortError') {
        console.error('NHTSA API request timeout');
        return res.status(504).json({
          error: 'NHTSA API request timed out',
          message: 'The request to the NHTSA API took too long to complete'
        });
      }
      
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

// Direct NHTSA API call as fallback
router.post('/direct-decode', async (req, res) => {
  try {
    const { vin } = req.body;
    
    if (!vin || vin.length !== 17) {
      return res.status(400).json({
        error: 'Valid 17-character VIN is required'
      });
    }
    
    const nhtsaUrl = `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`;
    console.log(`Making direct request to NHTSA API: ${nhtsaUrl}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    const response = await fetch(nhtsaUrl, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Phoenix-Automotive-App/1.0'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`NHTSA API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Process the data to extract only what we need
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
    
    res.json(vehicleInfo);
    
  } catch (error) {
    console.error('Direct VIN Decode Error:', error);
    res.status(500).json({
      error: 'Failed to decode VIN directly',
      details: error.message
    });
  }
});

// Helper function to extract values from NHTSA Results array
function extractValue(results, variableName) {
  if (!Array.isArray(results)) {
    return '';
  }
  const item = results.find(item => item.Variable === variableName);
  return item?.Value || '';
}

export default router;