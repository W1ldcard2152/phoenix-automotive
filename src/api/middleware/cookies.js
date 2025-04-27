// src/api/middleware/cookies.js

/**
 * Cookie security middleware
 * This middleware sets secure cookie options
 */
export const secureCookies = (req, res, next) => {
  // Get the original cookie setting function
  const originalSetCookie = res.cookie;
  
  // Override the cookie setting function
  res.cookie = function(name, value, options = {}) {
    // Default secure cookie options
    const secureOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      ...options
    };
    
    // Call the original function with secure options
    return originalSetCookie.call(this, name, value, secureOptions);
  };
  
  next();
};

/**
 * Cookie parser middleware for reading cookies
 * This is a simple version - in production, use the cookie-parser package
 */
export const cookieParser = (req, res, next) => {
  const cookies = {};
  const cookieHeader = req.headers.cookie;
  
  if (cookieHeader) {
    cookieHeader.split(';').forEach(cookie => {
      const parts = cookie.split('=');
      const name = parts[0].trim();
      const value = parts.slice(1).join('=').trim();
      
      if (name && value) {
        try {
          // Try to decode the cookie value
          cookies[name] = decodeURIComponent(value);
        } catch (e) {
          // If decoding fails, use the raw value
          cookies[name] = value;
        }
      }
    });
  }
  
  req.cookies = cookies;
  next();
};
