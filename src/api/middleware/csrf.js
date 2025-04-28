// src/api/middleware/csrf.js

/**
 * CSRF protection middleware
 * This implementation checks for a custom header and validates it against the stored token.
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
  
  // Get stored token from cookies
  const storedToken = req.cookies?.csrfToken;
  
  // Check if the token exists in cookies and matches the header
  if (!storedToken || csrfToken !== storedToken) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }
  
  next();
};

/**
 * Generate a secure CSRF token
 * This function generates a cryptographically secure random token
 */
export const generateCsrfToken = () => {
  // Generate a random token using Node.js crypto module
  // If crypto.randomBytes is not available, fallback to Math.random
  try {
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
  } catch (error) {
    // Fallback to Math.random (less secure but works as a fallback)
    console.warn('Using fallback CSRF token generation method');
    return Array(40)
      .fill(0)
      .map(() => Math.floor(Math.random() * 16).toString(16))
      .join('');
  }
};

/**
 * Set CSRF token in cookie
 * This middleware sets a CSRF token cookie for the client
 */
export const setCsrfToken = (req, res, next) => {
  // Only set for GET requests that might render forms
  if (req.method === 'GET' && !req.cookies?.csrfToken) {
    const token = generateCsrfToken();
    res.cookie('csrfToken', token, {
      httpOnly: false, // Needs to be accessible by JavaScript
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
  }
  next();
};
