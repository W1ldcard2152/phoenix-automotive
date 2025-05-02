// src/utils/vinUtils.js
const NHTSA_BASE_URL = '/api/vin/nhtsa'; // Use proxy endpoint instead of direct API call

export const decodeVinNHTSA = async (vin) => {
  try {
    // Validate VIN format before making request
    if (!validateVinFormat(vin)) {
      throw new Error('Invalid VIN format');
    }
    
    // Add timeout and controller for better error handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    console.log(`Attempting to decode VIN ${vin} using proxy endpoint`);
    
    // Use the correct URL format to ensure the proxy works correctly
    const url = `${NHTSA_BASE_URL}/${vin}`;
    console.log(`Request URL: ${url}`);
    
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json'
      }
    });
    
    clearTimeout(timeoutId);
   
    if (!response.ok) {
      let errorDetails = '';
      try {
        // Try to get more error details from response
        const errorResponse = await response.json();
        errorDetails = `: ${errorResponse.message || errorResponse.error || ''}`;
      } catch (e) {
        // If can't parse JSON, try to get text instead
        try {
          const text = await response.text();
          errorDetails = `: ${text.substring(0, 100)}`;
        } catch (textError) {
          // Ignore text extraction error
        }
      }
      
      console.error(`VIN decode API responded with status: ${response.status}${errorDetails}`);
      throw new Error(`Failed to decode VIN: HTTP error ${response.status}${errorDetails}`);
    }
    
    // Get the text first for safer parsing
    const text = await response.text();
    console.log('Response length:', text.length, 'Preview:', text.substring(0, 50));
    
    // Try to parse the text with error handling
    let data;
    try {
      // Remove potential BOM character and other invalid chars at the beginning
      const cleanedText = text.replace(/^\uFEFF/, '').trim();
      data = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Text preview:', text.substring(0, 200));
      throw new Error(`Failed to parse VIN API response: ${parseError.message}`);
    }
   
    // NHTSA specific error checking
    if (data.Message && data.Message.includes('Error')) {
      console.error('VIN decode API error:', data.Message);
      throw new Error(data.Message);
    }

    // Validate that Results exists
    if (!data.Results || !Array.isArray(data.Results)) {
      console.error('Unexpected response format:', data);
      throw new Error('Invalid response format: Results array missing');
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

    // Enhanced logging for debugging
    console.log('Extracted vehicle info:', {
      vin: vehicleInfo.vin,
      year: vehicleInfo.year,
      make: vehicleInfo.make,
      model: vehicleInfo.model
    });

    // Validate required fields
    if (!vehicleInfo.year || !vehicleInfo.make || !vehicleInfo.model) {
      console.error('Missing essential vehicle information in API response');
      console.log('Response data structure:', JSON.stringify(data).substring(0, 500));
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

// Helper function to safely extract values from NHTSA response
function extractValue(results, variableName) {
  const item = results.find(item => item.Variable === variableName);
  return item?.Value || '';
}

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
      const errorText = await response.text();
      console.error(`Database validation error: ${response.status}`, errorText);
      throw new Error(`Failed to validate VIN: ${errorText}`);
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

    // Step 1: Decode with NHTSA with retry logic
    let nhtsaInfo;
    let attempts = 0;
    const maxAttempts = 2;
    
    while (attempts < maxAttempts) {
      try {
        nhtsaInfo = await decodeVinNHTSA(formattedVin);
        break; // Success, exit the retry loop
      } catch (decodeError) {
        attempts++;
        console.error(`VIN decode attempt ${attempts} failed:`, decodeError);
        
        if (attempts >= maxAttempts) {
          throw decodeError; // Rethrow after max attempts
        }
        
        // Wait briefly before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
   
    // Step 2: Validate against our database
    const validatedInfo = await validateVinWithDatabase(formattedVin, nhtsaInfo);
   
    return validatedInfo;
  } catch (error) {
    console.error('VIN Decode Error:', error);
    throw error; // Re-throw to be handled by the calling component
  }
};