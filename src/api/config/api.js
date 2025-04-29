// src/config/api.js
const getBaseUrl = () => {
    if (import.meta.env.PROD) {
      // Use the current hostname for API requests in production
      // This ensures the API calls go to the same domain where the app is hosted
      const protocol = window.location.protocol;
      const hostname = window.location.hostname;
      
      // If we're on a render.com domain, use that
      if (hostname.includes('render.com')) {
        return `${protocol}//${hostname}`;
      }
      
      // Fallback to specific URL if needed
      return 'https://phoenix-automotive-dbue.onrender.com';
    }
    // For development
    return 'http://localhost:3000';
};
  
export const API_BASE_URL = getBaseUrl();