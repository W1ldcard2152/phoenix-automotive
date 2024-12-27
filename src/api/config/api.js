// src/config/api.js
const getBaseUrl = () => {
    if (import.meta.env.PROD) {
      // Replace this with your actual Render API service URL
      return 'https://phoenix-automotive-api.onrender.com';  // Update this with your actual Render URL
    }
    return 'http://localhost:3000';
  };
  
  export const API_BASE_URL = getBaseUrl();