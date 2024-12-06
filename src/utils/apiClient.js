const API_BASE_URL = 'http://localhost:3000/api'; 

const defaultHeaders = {
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache'
};

const jsonHeaders = {
  ...defaultHeaders,
  'Content-Type': 'application/json'
};


const url = `${API_BASE_URL}/dismantled-vehicles`;
console.log('Attempting to fetch from:', url);

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
  dismantledVehicles: {
    getAll: async () => {
      const url = `${API_BASE_URL}/dismantled-vehicles`;
      console.log('apiClient making request to:', url);
      
      try {
        const response = await fetch(url, {
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
        headers: defaultHeaders
      });
      return handleResponse(response);
    },
    create: async (data) => {
      const response = await fetch(`${API_BASE_URL}/dismantled-vehicles`, {
        method: 'POST',
        headers: jsonHeaders,
        body: JSON.stringify(data)
      });
      return handleResponse(response);
    },
    update: async (id, data) => {
      const response = await fetch(`${API_BASE_URL}/dismantled-vehicles/${id}`, {
        method: 'PUT',
        headers: jsonHeaders,
        body: JSON.stringify(data)
      });
      return handleResponse(response);
    },
    delete: async (id) => {
      const response = await fetch(`${API_BASE_URL}/dismantled-vehicles/${id}`, {
        method: 'DELETE',
        headers: defaultHeaders
      });
      return handleResponse(response);
    }
  },

  retailVehicles: {
    getAll: async () => {
      const url = `${API_BASE_URL}/retail-vehicles`;
      console.log('apiClient making request to:', url);
      
      try {
        const response = await fetch(url, {
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
        headers: defaultHeaders
      });
      return handleResponse(response);
    },
    create: async (data) => {
      const response = await fetch(`${API_BASE_URL}/retail-vehicles`, {
        method: 'POST',
        headers: jsonHeaders,
        body: JSON.stringify(data)
      });
      return handleResponse(response);
    },
    update: async (id, data) => {
      const response = await fetch(`${API_BASE_URL}/retail-vehicles/${id}`, {
        method: 'PUT',
        headers: jsonHeaders,
        body: JSON.stringify(data)
      });
      return handleResponse(response);
    },
    delete: async (id) => {
      const response = await fetch(`${API_BASE_URL}/retail-vehicles/${id}`, {
        method: 'DELETE',
        headers: defaultHeaders
      });
      return handleResponse(response);
    }
  },

  partRequests: {
    create: async (data) => {
      const response = await fetch(`${API_BASE_URL}/part-requests`, {
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
        headers: defaultHeaders
      });
      return handleResponse(response);
    }
  }
};