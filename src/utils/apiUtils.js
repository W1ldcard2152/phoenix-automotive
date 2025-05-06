// Create a new file: src/utils/apiUtils.js
export const rateLimitedFetch = async (url, options = {}, retryCount = 3) => {
    try {
      const response = await fetch(url, options);
      
      if (response.status === 429) { // Too Many Requests
        if (retryCount > 0) {
          const retryAfter = parseInt(response.headers.get('Retry-After') || '5');
          await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
          return rateLimitedFetch(url, options, retryCount - 1);
        }
        throw new Error('Rate limit exceeded after retries');
      }
      
      return response;
    } catch (error) {
      if (retryCount > 0 && error.name !== 'AbortError') {
        const backoffTime = Math.min(1000 * Math.pow(2, 3 - retryCount), 10000);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
        return rateLimitedFetch(url, options, retryCount - 1);
      }
      throw error;
    }
  };