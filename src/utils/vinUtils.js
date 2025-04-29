// src/utils/vinUtils.js
const NHTSA_BASE_URL = '/api/vin/nhtsa'; // Use proxy endpoint instead of direct API call

export const decodeVinNHTSA = async (vin) => {
  try {
    // Add timeout and controller for better error handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    console.log(`Attempting to decode VIN ${vin} using proxy endpoint`);
    const response = await fetch(`${NHTSA_BASE_URL}/${vin}`, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json'
      }
    });
    
    clearTimeout(timeoutId);
   
    if (!response.ok) {
      console.error(`VIN decode API responded with status: ${response.status}`);
      throw new Error(`Failed to decode VIN: HTTP error ${response.status}`);
    }
    
    const data = await response.json();
    console.log('VIN decode response received successfully');
   
    // NHTSA specific error checking
    if (data.Message && data.Message.includes('Error')) {
      console.error('VIN decode API error:', data.Message);
      throw new Error(data.Message);
    }

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

    // Validate required fields
    if (!vehicleInfo.year || !vehicleInfo.make || !vehicleInfo.model) {
      console.error('Missing essential vehicle information in API response');
      console.log('Response data:', data);
      throw new Error('Could not decode essential vehicle information');
    }

    return vehicleInfo;
  } catch (error) {
    // Check for abort error (timeout)
    if (error.name === 'AbortError') {
      console.error('VIN Decode Error: Request timed out');
      throw new Error('VIN decoding request timed out. Please try again.');
    }
    
    // Check for network errors
    if (error.name === 'TypeError' && error.message.includes('NetworkError')) {
      console.error('VIN Decode Network Error:', error);
      throw new Error('Network error when connecting to vehicle database. Please check your internet connection and try again.');
    }
    
    // Log and re-throw other errors
    console.error('VIN Decode Error:', error);
    throw new Error('Failed to decode VIN: ' + (error.message || 'Unknown error'));
  }
};

export const validateVinWithDatabase = async (vin, vehicleInfo) => {
  try {
    // Updated to use the correct endpoint
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
      throw new Error('Failed to validate VIN');
    }

    const data = await response.json();
    
    return {
      ...vehicleInfo,
      inInventory: data.inInventory,
      inventoryId: data.inventoryId,
      inventoryType: data.inventoryType // Added to match the server response
    };
  } catch (error) {
    console.error('Database Validation Error:', error);
    // Don't throw here - we still want to allow the request even if the vehicle isn't in our database
    return {
      ...vehicleInfo,
      inInventory: false
    };
  }
};

// Helper functions for VIN validation
export const validateVinFormat = (vin) => {
  // Basic VIN validation rules
  if (!vin || typeof vin !== 'string') return false;
 
  // Must be 17 characters
  if (vin.length !== 17) return false;
 
  // Must be alphanumeric and exclude I, O, Q
  if (!/^[A-HJ-NPR-Z0-9]{17}$/i.test(vin)) return false;
 
  return true;
};

export const formatVin = (vin) => {
  return vin.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '');
};

export const handleVinDecode = async (vin) => {
  try {
    // Format and validate VIN
    const formattedVin = formatVin(vin);
   
    if (!validateVinFormat(formattedVin)) {
      throw new Error('Invalid VIN format');
    }

    // Step 1: Decode with NHTSA
    const nhtsaInfo = await decodeVinNHTSA(formattedVin);
   
    // Step 2: Validate against our database
    const validatedInfo = await validateVinWithDatabase(formattedVin, nhtsaInfo);
   
    return validatedInfo;
  } catch (error) {
    console.error('VIN Decode Error:', error);
    throw error; // Re-throw to be handled by the calling component
  }
};