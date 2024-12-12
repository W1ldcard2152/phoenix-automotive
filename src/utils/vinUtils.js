// src/utils/vinUtils.js

const NHTSA_BASE_URL = 'https://vpic.nhtsa.dot.gov/api/vehicles/decodevin';

export const decodeVinNHTSA = async (vin) => {
  try {
    const response = await fetch(`${NHTSA_BASE_URL}/${vin}?format=json`);
    
    if (!response.ok) {
      throw new Error('Failed to decode VIN');
    }

    const data = await response.json();
    
    // NHTSA specific error checking
    if (data.Message && data.Message.includes('Error')) {
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
      throw new Error('Could not decode essential vehicle information');
    }

    return vehicleInfo;
  } catch (error) {
    console.error('VIN Decode Error:', error);
    throw new Error('Failed to decode VIN: ' + (error.message || 'Unknown error'));
  }
};

export const validateVinWithDatabase = async (vin, vehicleInfo) => {
  try {
    const response = await fetch('/api/vehicles/validate-vin', {
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
      const error = await response.json();
      throw new Error(error.message || 'Failed to validate VIN');
    }

    const data = await response.json();
    return {
      ...vehicleInfo,
      inInventory: data.inInventory,
      inventoryId: data.inventoryId,
      // Add any additional fields from our database
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
  
  // Must be alphanumeric
  if (!/^[A-HJ-NPR-Z0-9]{17}$/i.test(vin)) return false;
  
  return true;
};

export const formatVin = (vin) => {
  return vin.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '');
};

export const handleVinDecode = async (vin) => {
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
};