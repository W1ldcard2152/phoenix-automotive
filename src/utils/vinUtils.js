// src/utils/vinUtils.js

/**
 * Utility functions for VIN (Vehicle Identification Number) operations
 * Includes validation, decoding, and database lookup functions
 */

// Use direct NHTSA API for more reliable results
const NHTSA_API_URL = 'https://vpic.nhtsa.dot.gov/api/vehicles/decodevin';

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
 * Format a VIN by removing invalid characters and converting to uppercase
 * @param {String} vin - The VIN to format
 * @returns {String} The formatted VIN
 */
export const formatVin = (vin) => {
  if (!vin || typeof vin !== 'string') return '';
  return vin.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '');
};

/**
 * Validate VIN format according to standard rules
 * @param {String} vin - The VIN to validate
 * @returns {Boolean} Whether the VIN is valid
 */
export const validateVinFormat = (vin) => {
  // Basic VIN validation rules
  if (!vin || typeof vin !== 'string') return false;
 
  // Must be 17 characters
  if (vin.length !== 17) return false;
 
  // Must be alphanumeric and exclude I, O, Q
  if (!/^[A-HJ-NPR-Z0-9]{17}$/i.test(vin)) return false;
 
  return true;
};

/**
 * Decode a VIN using NHTSA API directly
 * @param {String} vin - The VIN to decode
 * @returns {Object} Vehicle information from NHTSA
 */
export const decodeVinNHTSA = async (vin) => {
  try {
    // Validate VIN format before making request
    if (!validateVinFormat(vin)) {
      throw new Error('Invalid VIN format');
    }
    
    console.log(`Making direct NHTSA API call for VIN ${vin}`);
    
    // Make direct request to NHTSA API
    const url = `${NHTSA_API_URL}/${vin}?format=json`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Phoenix-Automotive-App/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`NHTSA API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Validate API response
    if (!data.Results || !Array.isArray(data.Results)) {
      throw new Error('Invalid NHTSA API response format');
    }

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

    // Validate required fields
    if (!vehicleInfo.year || !vehicleInfo.make || !vehicleInfo.model) {
      throw new Error('Could not decode essential vehicle information');
    }

    return vehicleInfo;
  } catch (error) {
    console.error('NHTSA API Error:', error);
    throw error;
  }
};

/**
 * Check if VIN exists in our database
 * @param {String} vin - The VIN to check
 * @param {Object} vehicleInfo - Vehicle information to include
 * @returns {Object} Enhanced vehicle info with inventory status
 */
export const validateVinWithDatabase = async (vin, vehicleInfo) => {
  try {
    const response = await fetch('/api/vin/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vin,
        vehicleInfo
      })
    });

    if (!response.ok) {
      // Don't throw - just return the vehicle info without inventory data
      console.warn(`Database validation returned status: ${response.status}`);
      return {
        ...vehicleInfo,
        inInventory: false
      };
    }

    const data = await response.json();
    
    return {
      ...vehicleInfo,
      inInventory: data.inInventory || false,
      inventoryId: data.inventoryId,
      inventoryType: data.inventoryType
    };
  } catch (error) {
    console.warn('Database validation error:', error);
    // Don't throw - we still want to allow the request even if db check fails
    return {
      ...vehicleInfo,
      inInventory: false
    };
  }
};

/**
 * Main function to handle VIN decoding with fallbacks
 * @param {String} vin - The VIN to decode
 * @returns {Object} Complete vehicle information
 */
export const handleVinDecode = async (vin) => {
  try {
    // Try local cache first
    const cacheKey = `vin_${vin}`;
    const cachedData = localStorage.getItem(cacheKey);
    
    if (cachedData) {
      return JSON.parse(cachedData);
    }
    
    // Multiple strategies with fallbacks
    let vehicleInfo = null;
    
    // Strategy 1: Try server proxy
    try {
      const response = await fetch('/api/vin/direct-decode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vin })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.vehicleInfo) {
          vehicleInfo = data.vehicleInfo;
          // Save to cache
          localStorage.setItem(cacheKey, JSON.stringify(vehicleInfo));
          return vehicleInfo;
        }
      }
    } catch (proxyError) {
      console.warn('Proxy error:', proxyError);
    }
    
    // Strategy 2: Direct NHTSA
    // Similar implementation...
    
    throw new Error('All VIN decode methods failed');
  } catch (error) {
    console.error('VIN Decode Error:', error);
    throw error;
  }
};