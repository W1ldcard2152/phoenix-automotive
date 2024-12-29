const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api'
  : 'http://localhost:3000/api';

const defaultHeaders = {
  'Accept': 'application/json',
  'Content-Type': 'application/json'
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
  const finalOptions = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    },
    mode: 'cors'
  };

  try {
    console.log(`Making ${options.method || 'GET'} request to:`, url);
    const response = await fetch(url, finalOptions);
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorDetail;
      try {
        errorDetail = JSON.parse(errorText);
      } catch {
        errorDetail = errorText;
      }
      
      throw new Error(`HTTP error! status: ${response.status}, details: ${JSON.stringify(errorDetail)}`);
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
    create: (data) => makeRequest(`${API_BASE_URL}/dismantled-vehicles`, {
      method: 'POST',
      body: JSON.stringify(data)
    }).then(handleResponse),
    update: (id, data) => makeRequest(`${API_BASE_URL}/dismantled-vehicles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }).then(handleResponse),
    delete: (id) => makeRequest(`${API_BASE_URL}/dismantled-vehicles/${id}`, {
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
    getById: (id) => makeRequest(`${API_BASE_URL}/retail-vehicles/${id}`).then(handleResponse),
    create: (data) => makeRequest(`${API_BASE_URL}/retail-vehicles`, {
      method: 'POST',
      body: JSON.stringify(data)
    }).then(handleResponse),
    update: (id, data) => makeRequest(`${API_BASE_URL}/retail-vehicles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }).then(handleResponse),
    delete: (id) => makeRequest(`${API_BASE_URL}/retail-vehicles/${id}`, {
      method: 'DELETE'
    }).then(handleResponse)
  },

  partRequests: {
    create: (data) => makeRequest(`${API_BASE_URL}/part-requests`, {
      method: 'POST',
      body: JSON.stringify(data)
    }).then(handleResponse),
    getAll: () => makeRequest(`${API_BASE_URL}/part-requests`).then(handleResponse),
    getById: (id) => makeRequest(`${API_BASE_URL}/part-requests/${id}`).then(handleResponse),
    update: (id, data) => makeRequest(`${API_BASE_URL}/part-requests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
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
  }
};