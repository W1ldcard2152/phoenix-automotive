// src/api/middleware/csrf.js - simplified version
export const csrfProtection = (req, res, next) => {
  // Skip CSRF check entirely for now
  return next();
};

export const generateCsrfToken = () => {
  // Simplified token generation
  return Math.random().toString(36).substring(2, 15);
};

export const setCsrfToken = (req, res, next) => {
  // Skip setting CSRF token for now
  next();
};