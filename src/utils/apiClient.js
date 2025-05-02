const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api'
  : 'http://localhost:3000/api';

const defaultHeaders = {
  'Accept': 'application/json',
  'Content-Type': 'application/json'
};

// Simplified makeRequest function - CSRF token handling removed
async function makeRequest(url, options = {}) {
  const { method = 'GET' } = options;
  
  // Get authentication token from localStorage
  const authToken = localStorage.getItem('authToken');
  const isAdminRoute = url.includes('/admin/');
  console.log(`Auth for ${url}: Token ${authToken ? 'found' : 'missing'}, Admin route: ${isAdminRoute}`);
  
  // If this is an admin route and no token is found, log a warning
  if (isAdminRoute && !authToken) {
    console.warn('⚠️ Attempting to access admin route without auth token:', url);
  }
  
  const finalOptions = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
      ...options.headers
    },
    mode: 'cors',
    credentials: 'include'
  };
  
  // Log the complete request configuration for admin routes
  if (isAdminRoute) {
    console.log('Admin request config:', {
      url,
      method: finalOptions.method || 'GET',
      hasAuthHeader: !!finalOptions.headers?.Authorization
    });  
  }

  try {
    console.log(`Making ${options.method || 'GET'} request to:`, url);
    const response = await fetch(url, finalOptions);
    
    if (!response.ok) {
      const status = response.status;
      let errorMessage = `HTTP error! status: ${status}`;
      
      try {
        // Try to get a more detailed error message from the response
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch (e) {
        // If JSON parsing fails, try to get text content
        try {
          const errorText = await response.text();
          if (errorText) errorMessage = errorText;
        } catch (textError) {
          // If both JSON and text parsing fail, use status text
          errorMessage = response.statusText || errorMessage;
        }
      }
      
      console.error(`API Error: ${errorMessage}`);
      throw new Error(errorMessage);
    }
    
    return response;
  } catch (error) {
    console.error('Network request failed:', {
      url,
      method: options.method || 'GET',
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}

// Handle response processing
async function handleResponse(response) {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  try {
    // Get the raw text
    let text = await response.text();

    // Handle empty response
    if (!text) {
      return [];
    }

    // Try to parse as JSON
    try {
      // First attempt: direct parse
      const data = JSON.parse(text);
      return Array.isArray(data) ? data : [data];
    } catch (firstError) {
      console.error('First parse attempt failed:', firstError);
      
      try {
        // Second attempt: clean the text and try again
        text = text.replace(/[\u0000-\u0019]+/g, ""); // Remove control characters
        const cleanedData = JSON.parse(text);
        return Array.isArray(cleanedData) ? cleanedData : [cleanedData];
      } catch (secondError) {
        console.error('Second parse attempt failed:', secondError);
        
        try {
          // Third attempt: try to extract array portion
          const arrayMatch = text.match(/\[(.*)\]/s);
          if (arrayMatch) {
            const arrayContent = arrayMatch[0];
            const parsedArray = JSON.parse(arrayContent);
            return Array.isArray(parsedArray) ? parsedArray : [parsedArray];
          }
        } catch (thirdError) {
          console.error('Third parse attempt failed:', thirdError);
        }
        
        throw new Error('Failed to parse response data');
      }
    }
  } catch (error) {
    console.error('Response handling error:', error);
    throw new Error('Failed to process response');
  }
}

export const apiClient = {
  dismantledVehicles: {
    getAll: async () => {
      try {
        // For the admin panel, use the admin route instead of the public route
        const isAdminPanel = window.location.pathname.includes('/admin');
        const endpoint = isAdminPanel ? `${API_BASE_URL}/admin/dismantled-vehicles` : `${API_BASE_URL}/dismantled-vehicles`;
        console.log('Using endpoint for getAll dismantled vehicles:', endpoint);
        
        const response = await makeRequest(endpoint);
        const data = await handleResponse(response);
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error('Failed to fetch vehicles:', error);
        throw new Error('Failed to fetch vehicles');
      }
    },
    getById: (id) => makeRequest(`${API_BASE_URL}/dismantled-vehicles/${id}`).then(handleResponse),
    create: (data) => makeRequest(`${API_BASE_URL}/admin/dismantled-vehicles`, {
      method: 'POST',
      body: JSON.stringify(data)
    }).then(handleResponse),
    update: (id, data) => makeRequest(`${API_BASE_URL}/admin/dismantled-vehicles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }).then(handleResponse),
    delete: (id) => makeRequest(`${API_BASE_URL}/admin/dismantled-vehicles/${id}`, {
      method: 'DELETE'
    }).then(handleResponse)
  },

  retailVehicles: {
    getAll: async () => {
      try {
        // For the admin panel, use the admin route instead of the public route
        const isAdminPanel = window.location.pathname.includes('/admin');
        const endpoint = isAdminPanel ? `${API_BASE_URL}/admin/retail-vehicles` : `${API_BASE_URL}/retail-vehicles`;
        console.log('Using endpoint for getAll retail vehicles:', endpoint);
        
        const response = await makeRequest(endpoint);
        const data = await handleResponse(response);
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error('Failed to fetch vehicles:', error);
        throw new Error('Failed to fetch vehicles');
      }
    },
    getById: async (id) => {
      try {
        if (!id) throw new Error('Vehicle ID is required');
        console.log('Fetching retail vehicle by ID:', id);
        
        const response = await makeRequest(`${API_BASE_URL}/retail-vehicles/${id}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          throw new Error(`Failed to fetch vehicle: ${response.status} ${response.statusText}`);
        }
        
        return response.json();
      } catch (error) {
        console.error('Failed to fetch vehicle by ID:', error);
        throw error;
      }
    },
    create: (data) => makeRequest(`${API_BASE_URL}/admin/retail-vehicles`, {
      method: 'POST',
      body: JSON.stringify(data)
    }).then(handleResponse),
    update: (id, data) => makeRequest(`${API_BASE_URL}/admin/retail-vehicles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }).then(handleResponse),
    delete: (id) => makeRequest(`${API_BASE_URL}/admin/retail-vehicles/${id}`, {
      method: 'DELETE'
    }).then(handleResponse)
  },

  partRequests: {
    create: (data) => makeRequest(`${API_BASE_URL}/part-requests`, {
      method: 'POST',
      body: JSON.stringify(data)
    }).then(handleResponse),
    getAll: async () => {
      try {
        // Ensure we're using the admin endpoint for admin panel requests
        console.log('Fetching all part requests...');
        const response = await makeRequest(`${API_BASE_URL}/admin/part-requests`);
        const data = await handleResponse(response);
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error('Failed to fetch part requests:', error);
        throw new Error('Failed to fetch part requests');
      }
    },
    getById: (id) => makeRequest(`${API_BASE_URL}/admin/part-requests/${id}`).then(handleResponse),
    update: (id, data) => makeRequest(`${API_BASE_URL}/admin/part-requests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }).then(handleResponse)
  },
  
  repairRequests: {
    create: async (data) => {
      try {
        const response = await fetch(`${API_BASE_URL}/repair-requests`, {
          method: 'POST',
          headers: defaultHeaders,
          credentials: 'include',
          body: JSON.stringify(data)
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response from repair request:', errorText);
          throw new Error(`Failed to submit repair request: ${response.status}`);
        }
        
        return response.json();
      } catch (error) {
        console.error('Repair request submission error:', error);
        throw error;
      }
    },
    getAll: async () => {
      try {
        // Ensure we're using the admin endpoint for admin panel requests
        console.log('Fetching all repair requests...');
        const response = await makeRequest(`${API_BASE_URL}/admin/repair-requests`);
        const data = await handleResponse(response);
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error('Failed to fetch repair requests:', error);
        throw new Error('Failed to fetch repair requests');
      }
    },
    getById: (id) => makeRequest(`${API_BASE_URL}/admin/repair-requests/${id}`).then(handleResponse),
    update: (id, data) => makeRequest(`${API_BASE_URL}/admin/repair-requests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }).then(handleResponse),
    delete: (id) => makeRequest(`${API_BASE_URL}/admin/repair-requests/${id}`, {
      method: 'DELETE'
    }).then(handleResponse)
  },

  vin: {
    /**
     * Decode a VIN using multiple strategies with fallbacks
     * @param {String} vin - The VIN to decode
     * @returns {Object} Vehicle information
     */
    decode: async (vin) => {
      try {
        // Strategy 1: Try our server proxy endpoint
        try {
          console.log('Attempting VIN decode via server proxy:', vin);
          const response = await fetch('/api/vin/direct-decode', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ vin })
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.vehicleInfo) {
              console.log('Server proxy VIN decode successful');
              return data;
            } else {
              console.warn('Server proxy returned no vehicle info');
            }
          } else {
            const errorText = await response.text();
            console.warn('Server proxy failed:', response.status, errorText);
          }
        } catch (proxyError) {
          console.error('Server proxy error:', proxyError);
          // Continue to next strategy
        }
        
        // Strategy 2: Try direct NHTSA API call
        try {
          console.log('Attempting direct NHTSA call:', vin);
          const nhtsaUrl = `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`;
          
          const directResponse = await fetch(nhtsaUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'Phoenix-Automotive-App/1.0'
            }
          });
          
          if (!directResponse.ok) {
            throw new Error(`Direct NHTSA API call failed: ${directResponse.status}`);
          }
          
          const nhtsaData = await directResponse.json();
          
          // Extract vehicle info
          const extractValue = (results, variableName) => {
            const item = results.find(item => item.Variable === variableName);
            return item?.Value || '';
          };
          
          const vehicleInfo = {
            vin: vin,
            year: extractValue(nhtsaData.Results, "Model Year"),
            make: extractValue(nhtsaData.Results, "Make"),
            model: extractValue(nhtsaData.Results, "Model"),
            trim: extractValue(nhtsaData.Results, "Trim"),
            engineSize: extractValue(nhtsaData.Results, "Displacement (L)"),
            engineCylinders: extractValue(nhtsaData.Results, "Engine Number of Cylinders"),
            transmissionType: extractValue(nhtsaData.Results, "Transmission Style"),
            driveType: extractValue(nhtsaData.Results, "Drive Type")
          };
          
          console.log('Direct NHTSA call successful');
          return { vehicleInfo, rawData: nhtsaData };
        } catch (directError) {
          console.error('Direct NHTSA API call failed:', directError);
          throw directError;
        }
      } catch (error) {
        console.error('VIN Decode Error:', error);
        throw new Error('Failed to decode VIN: ' + (error.message || 'Unknown error'));
      }
    },
    
    /**
     * Test the NHTSA API connection
     * @returns {Object} Test results
     */
    testConnection: async () => {
      try {
        const response = await fetch('/api/vin/test-connection');
        return response.json();
      } catch (error) {
        console.error('API Connection test failed:', error);
        throw error;
      }
    },
    
    /**
     * Validate a VIN against our database
     * @param {String} vin - The VIN to validate
     * @param {Object} vehicleInfo - Optional vehicle info
     * @returns {Object} Validation results
     */
    validate: async (vin, vehicleInfo = null) => {
      try {
        const response = await fetch('/api/vin/validate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ vin, vehicleInfo })
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Validation failed: ${errorText}`);
        }
        
        return response.json();
      } catch (error) {
        console.error('VIN validation error:', error);
        throw error;
      }
    }
  },

  parts: {
    search: (query) => makeRequest(
      `${API_BASE_URL}/parts/search?q=${encodeURIComponent(query)}`
    ).then(handleResponse)
  },
  
  // Add image upload utility with simplified headers
  upload: {
    image: (formData) => {
      // Don't use JSON for FormData
      const authToken = localStorage.getItem('authToken');
      
      return fetch(`${API_BASE_URL}/admin/upload`, {
        method: 'POST',
        headers: {
          ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
        },
        body: formData,
        credentials: 'include'
      }).then(async (response) => {
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Upload failed response:', errorText);
          throw new Error(`Upload failed: ${errorText}`);
        }
        return response.json();
      });
    }
  }
};