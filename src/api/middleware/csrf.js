// src/api/middleware/csrf.js

/**
 * CSRF protection middleware
 * This is a simple CSRF protection that checks for a custom header.
 * In a production environment, consider using a more robust solution like csurf.
 */
export const csrfProtection = (req, res, next) => {
  // Skip for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  
  const csrfToken = req.headers['x-csrf-token'];
  
  if (!csrfToken) {
    return res.status(403).json({ error: 'CSRF token missing' });
  }
  
  // For a more secure implementation, you would validate the token against a stored token
  // This simple version just checks for the presence of the header
  
  next();
};

// More secure version (for reference, not implemented here)
// This would require server-side session storage or token verification
/*
export const csrfProtection = (req, res, next) => {
  // Skip for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  
  const csrfToken = req.headers['x-csrf-token'];
  const sessionToken = req.session.csrfToken; // Would require session middleware
  
  if (!csrfToken || !sessionToken || csrfToken !== sessionToken) {
    return res.status(403).json({ error: 'Invalid or missing CSRF token' });
  }
  
  next();
};
*/
