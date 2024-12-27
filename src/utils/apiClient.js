const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api'  // In production, use relative path
  : 'http://localhost:3000/api'; // In development, use full URL

const defaultHeaders = {
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
  'Accept': 'application/json',
  'Content-Type': 'application/json'
};

const jsonHeaders = {
  ...defaultHeaders,
  'Content-Type': 'application/json'
};

const fetchOptions = {
  credentials: 'include', // Important for CORS
  mode: 'cors' // Explicitly state we want CORS
};

async function handleResponse(response) {
  if (!response.ok) {
    let errorMessage;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || `HTTP error! status: ${response.status}`;
    } catch (error) {
      errorMessage = `HTTP error! status: ${response.status} - ${error.message}`;
    }
    throw new Error(errorMessage);
  }
  return response.json();
}

export const apiClient = {
  // Dismantled vehicles methods
  dismantledVehicles: {
    getAll: async () => {
      const url = `${API_BASE_URL}/dismantled-vehicles`;
      console.log('apiClient making request to:', url);
      
      try {
        const response = await fetch(url, {
          ...fetchOptions,
          headers: defaultHeaders
        });
        console.log('apiClient received response:', {
          ok: response.ok,
          status: response.status,
          statusText: response.statusText
        });
        return response;
      } catch (error) {
        console.error('apiClient fetch error:', error);
        throw error;
      }
    },
    getById: async (id) => {
      const response = await fetch(`${API_BASE_URL}/dismantled-vehicles/${id}`, {
        ...fetchOptions,
        headers: defaultHeaders
      });
      return handleResponse(response);
    },
    create: async (data) => {
      const response = await fetch(`${API_BASE_URL}/dismantled-vehicles`, {
        ...fetchOptions,
        method: 'POST',
        headers: jsonHeaders,
        body: JSON.stringify(data)
      });
      return handleResponse(response);
    },
    update: async (id, data) => {
      const response = await fetch(`${API_BASE_URL}/dismantled-vehicles/${id}`, {
        ...fetchOptions,
        method: 'PUT',
        headers: jsonHeaders,
        body: JSON.stringify(data)
      });
      return handleResponse(response);
    },
    delete: async (id) => {
      const response = await fetch(`${API_BASE_URL}/dismantled-vehicles/${id}`, {
        ...fetchOptions,
        method: 'DELETE',
        headers: defaultHeaders
      });
      return handleResponse(response);
    }
  },

  // Retail vehicles methods
  retailVehicles: {
    getAll: async () => {
      const url = `${API_BASE_URL}/retail-vehicles`;
      console.log('apiClient making request to:', url);
      
      try {
        const response = await fetch(url, {
          ...fetchOptions,
          headers: defaultHeaders
        });
        console.log('apiClient received response:', {
          ok: response.ok,
          status: response.status,
          statusText: response.statusText
        });
        return response;
      } catch (error) {
        console.error('apiClient fetch error:', error);
        throw error;
      }
    },
    getById: async (id) => {
      const response = await fetch(`${API_BASE_URL}/retail-vehicles/${id}`, {
        ...fetchOptions,
        headers: defaultHeaders
      });
      return handleResponse(response);
    },
    create: async (data) => {
      const response = await fetch(`${API_BASE_URL}/retail-vehicles`, {
        ...fetchOptions,
        method: 'POST',
        headers: jsonHeaders,
        body: JSON.stringify(data)
      });
      return handleResponse(response);
    },
    update: async (id, data) => {
      const response = await fetch(`${API_BASE_URL}/retail-vehicles/${id}`, {
        ...fetchOptions,
        method: 'PUT',
        headers: jsonHeaders,
        body: JSON.stringify(data)
      });
      return handleResponse(response);
    },
    delete: async (id) => {
      const response = await fetch(`${API_BASE_URL}/retail-vehicles/${id}`, {
        ...fetchOptions,
        method: 'DELETE',
        headers: defaultHeaders
      });
      return handleResponse(response);
    }
  },

  // Part requests methods
  partRequests: {
    create: async (data) => {
      console.log('Creating part request:', data);
      const response = await fetch(`${API_BASE_URL}/part-requests`, {
        ...fetchOptions,
        method: 'POST',
        headers: jsonHeaders,
        body: JSON.stringify(data)
      });
      return handleResponse(response);
    },
    getAll: async () => {
      const url = `${API_BASE_URL}/part-requests`;
      console.log('apiClient making request to:', url);
      
      try {
        const response = await fetch(url, {
          ...fetchOptions,
          headers: defaultHeaders
        });
        console.log('apiClient received response:', {
          ok: response.ok,
          status: response.status,
          statusText: response.statusText
        });
        return response;
      } catch (error) {
        console.error('apiClient fetch error:', error);
        throw error;
      }
    },
    getById: async (id) => {
      const response = await fetch(`${API_BASE_URL}/part-requests/${id}`, {
        ...fetchOptions,
        headers: defaultHeaders
      });
      return handleResponse(response);
    },
    update: async (id, data) => {
      const response = await fetch(`${API_BASE_URL}/part-requests/${id}`, {
        ...fetchOptions,
        method: 'PUT',
        headers: jsonHeaders,
        body: JSON.stringify(data)
      });
      return handleResponse(response);
    }
  },

  // VIN validation methods
  vin: {
    decode: async (vin) => {
      console.log('Decoding VIN:', vin);
      const response = await fetch(`${API_BASE_URL}/vin/decode`, {
        ...fetchOptions,
        method: 'POST',
        headers: jsonHeaders,
        body: JSON.stringify({ vin })
      });
      return handleResponse(response);
    },
    
    validate: async (vin, vehicleInfo) => {
      console.log('Validating VIN:', vin, vehicleInfo);
      const response = await fetch(`${API_BASE_URL}/vin/validate`, {
        ...fetchOptions,
        method: 'POST',
        headers: jsonHeaders,
        body: JSON.stringify({ vin, vehicleInfo })
      });
      return handleResponse(response);
    }
  },

  // Parts search methods
  parts: {
    search: async (query) => {
      console.log('Searching parts:', query);
      const response = await fetch(`${API_BASE_URL}/parts/search?q=${encodeURIComponent(query)}`, {
        ...fetchOptions,
        headers: defaultHeaders
      });
      return handleResponse(response);
    }
  }
};