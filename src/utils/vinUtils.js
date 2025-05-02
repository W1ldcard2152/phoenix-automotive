// src/utils/vinUtils.js

// Use proxy endpoint for VIN decoding
const NHTSA_BASE_URL = '/api/vin/nhtsa';
const DIRECT_DECODE_URL = '/api/vin/direct-decode';

/**
 * Decode a VIN using the NHTSA API (via our proxy)
 * Includes fallback mechanisms for handling HTML responses and other errors
 */
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
    
    try {
      // First try the proxy endpoint
      const response = await fetch(`${NHTSA_BASE_URL}/${vin}`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.error(`Proxy API responded with status: ${response.status}`);
        throw new Error(`Failed to decode VIN through proxy: HTTP ${response.status}`);
      }
      
      // Get the response as text first for safer processing
      const text = await response.text();
      console.log('Response length:', text.length, 'Preview:', text.substring(0, 50));
      
      // Check if we got HTML instead of JSON
      if (text.toLowerCase().includes('<!doctype html>') || text.toLowerCase().includes('<html')) {
        console.warn('HTML content detected in response, trying direct API call');
        throw new Error('HTML content detected in response');
      }
      
      // Try to parse the text as JSON
      let data;
      try {
        // Remove potential BOM character and other invalid chars
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
        throw new Error('Could not decode essential vehicle information');
      }

      return vehicleInfo;
    } catch (proxyError) {
      // If proxy fails, try direct API call as fallback
      console.warn('Proxy API call failed, trying direct call:', proxyError.message);
      
      try {
        console.log(`Making direct API call for VIN ${vin}`);
        const directResponse = await fetch(DIRECT_DECODE_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ vin })
        });
        
        if (!directResponse.ok) {
          console.error(`Direct API call failed with status: ${directResponse.status}`);
          throw new Error(`Direct API call failed: HTTP ${directResponse.status}`);
        }
        
        const vehicleInfo = await directResponse.json();
        
        // Validate required fields
        if (!vehicleInfo.year || !vehicleInfo.make || !vehicleInfo.model) {
          console.error('Missing essential vehicle information in direct API response');
          throw new Error('Could not decode essential vehicle information');
        }
        
        console.log('Successfully received vehicle info from direct API call');
        return vehicleInfo;
      } catch (directError) {
        console.error('Direct API call failed:', directError);
        throw new Error(`All VIN decode attempts failed: ${directError.message}`);
      }
    }
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

/**
 * Helper function to safely extract values from NHTSA response
 */
function extractValue(results, variableName) {
  try {
    const item = results.find(item => item.Variable === variableName);
    return item?.Value || '';
  } catch (e) {
    console.error(`Error extracting ${variableName}:`, e);
    return '';
  }
}

/**
 * Check if a vehicle with this VIN exists in our database
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
      const errorText = await response.text();
      console.error(`Database validation error: ${response.status}`, errorText);
      throw new Error(`Failed to validate VIN: ${errorText}`);
    }

    const data = await response.json();
    
    return {
      ...vehicleInfo,
      inInventory: data.inInventory,
      inventoryId: data.inventoryId,
      inventoryType: data.inventoryType
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

/**
 * Validate VIN format (17 characters, alphanumeric excluding I, O, Q)
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
 * Format VIN to uppercase and remove invalid characters
 */
export const formatVin = (vin) => {
  if (!vin) return '';
  return vin.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '');
};

/**
 * Main VIN decode handler - combines NHTSA decoding with database validation
 */
export const handleVinDecode = async (vin) => {
  try {
    // Format and validate VIN
    const formattedVin = formatVin(vin);
   
    if (!validateVinFormat(formattedVin)) {
      throw new Error('Invalid VIN format. VIN should be 17 alphanumeric characters (excluding I, O, Q).');
    }

    // Step 1: Decode with NHTSA with retry logic
    let nhtsaInfo;
    let attempts = 0;
    const maxAttempts = 2;
    
    while (attempts < maxAttempts) {
      try {
        console.log(`VIN decode attempt ${attempts + 1} for ${formattedVin}`);
        nhtsaInfo = await decodeVinNHTSA(formattedVin);
        break; // Success, exit the retry loop
      } catch (decodeError) {
        attempts++;
        console.error(`VIN decode attempt ${attempts} failed:`, decodeError);
        
        if (attempts >= maxAttempts) {
          // Provide a user-friendly error message on final failure
          if (decodeError.message.includes('JSON.parse') || 
              decodeError.message.includes('HTML content')) {
            throw new Error('Vehicle database service is temporarily unavailable. Please try again later.');
          } else {
            throw decodeError; // Rethrow after max attempts
          }
        }
        
        // Wait briefly before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
   
    // Step 2: Validate against our database
    console.log('VIN decoded successfully, checking against our database');
    const validatedInfo = await validateVinWithDatabase(formattedVin, nhtsaInfo);
   
    return validatedInfo;
  } catch (error) {
    console.error('VIN Decode Handler Error:', error);
    throw error; // Re-throw to be handled by the calling component
  }
};