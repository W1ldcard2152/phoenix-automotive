const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api'
  : 'http://localhost:3000/api';

const defaultHeaders = {
  'Accept': 'application/json',
  'Content-Type': 'application/json'
};

// Get CSRF token from cookie
const getCsrfToken = () => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; csrfToken=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

// Add CSRF token to headers for non-GET requests
const addCsrfToken = (method, headers) => {
  if (method !== 'GET') {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      return {
        ...headers,
        'X-CSRF-Token': csrfToken
      };
    }
  }
  return headers;
};

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

// Update the makeRequest function in apiClient.js
async function makeRequest(url, options = {}) {
  const { method = 'GET' } = options;
  
  const finalOptions = {
    ...options,
    headers: addCsrfToken(method, {
      ...defaultHeaders,
      ...options.headers
    }),
    mode: 'cors',
    credentials: 'include'
  };

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

export const apiClient = {
  dismantledVehicles: {
    getAll: async () => {
      try {
        const response = await makeRequest(`${API_BASE_URL}/dismantled-vehicles`);
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
        const response = await makeRequest(`${API_BASE_URL}/retail-vehicles`);
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
    getAll: () => makeRequest(`${API_BASE_URL}/admin/part-requests`).then(handleResponse),
    getById: (id) => makeRequest(`${API_BASE_URL}/admin/part-requests/${id}`).then(handleResponse),
    update: (id, data) => makeRequest(`${API_BASE_URL}/admin/part-requests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }).then(handleResponse)
  },
  
  repairRequests: {
    create: async (data) => {
      try {
        const csrfToken = getCsrfToken();
        const response = await fetch(`${API_BASE_URL}/repair-requests`, {
          method: 'POST',
          headers: {
            ...defaultHeaders,
            'X-CSRF-Token': csrfToken || ''
          },
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
    getAll: () => makeRequest(`${API_BASE_URL}/admin/repair-requests`).then(handleResponse),
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
    decode: (vin) => makeRequest(`${API_BASE_URL}/vin/decode`, {
      method: 'POST',
      body: JSON.stringify({ vin })
    }).then(handleResponse),
    
    validate: (vin, vehicleInfo) => makeRequest(`${API_BASE_URL}/vin/validate`, {
      method: 'POST',
      body: JSON.stringify({ vin, vehicleInfo })
    }).then(handleResponse)
  },

  parts: {
    search: (query) => makeRequest(
      `${API_BASE_URL}/parts/search?q=${encodeURIComponent(query)}`
    ).then(handleResponse)
  },

  // Delete this duplicate entry
  
  // Add image upload utility
  upload: {
    image: (formData) => {
      // Don't use JSON for FormData
      const csrfToken = getCsrfToken();
      console.log('Using CSRF token for upload:', csrfToken ? 'token present' : 'token missing');
      
      return fetch(`${API_BASE_URL}/admin/upload`, {
        method: 'POST',
        headers: {
          'X-CSRF-Token': csrfToken || ''
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