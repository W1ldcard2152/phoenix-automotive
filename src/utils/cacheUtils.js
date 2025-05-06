// Add to src/utils/cacheUtils.js
export const createCache = (ttlMs = 60000) => {
    const cache = new Map();
    
    return {
      get: (key) => {
        const item = cache.get(key);
        if (!item) return null;
        
        if (Date.now() > item.expiry) {
          cache.delete(key);
          return null;
        }
        
        return item.value;
      },
      
      set: (key, value) => {
        cache.set(key, {
          value,
          expiry: Date.now() + ttlMs
        });
      }
    };
  };
  
  // Use in components
  const vehicleCache = createCache(5 * 60 * 1000); // 5 minute cache
  
  // Before making API calls, check cache
  const cachedData = vehicleCache.get('vehicles');
  if (cachedData) {
    setVehicles(cachedData);
    return;
  }
  
  // After successful API call
  vehicleCache.set('vehicles', data);