// src/api/middleware/security.js
/**
 * Security middleware
 * This file includes various security-related middleware functions for the API
 * 
 * In a production environment, you should install and use the 'helmet' package:
 * npm install helmet
 * import helmet from 'helmet';
 * app.use(helmet());
 */

// Basic security headers middleware
export const securityHeaders = (req, res, next) => {
  // Content Security Policy - updated to allow Google Maps
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://maps.googleapis.com https://maps.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: blob:; connect-src 'self' https://vpic.nhtsa.dot.gov https://maps.googleapis.com https://maps.google.com; font-src 'self' https://fonts.gstatic.com; object-src 'none'; media-src 'self'; frame-ancestors 'self'; frame-src https://www.google.com https://maps.google.com; form-action 'self'; base-uri 'self';"
  );
  
  // HTTP Strict Transport Security (HSTS)
  res.setHeader(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains'
  );
  
  // X-Content-Type-Options
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // X-Frame-Options - Updated to allow same origin frames
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  
  // X-XSS-Protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer-Policy - Updated to be less restrictive
  res.setHeader('Referrer-Policy', 'origin-when-cross-origin');
  
  // Permissions-Policy - Updated to allow some features
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(self), interest-cohort=()'
  );
  
  // Cache-Control for API responses
  if (req.path.startsWith('/api/') && req.method === 'GET') {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  
  next();
};

// Rate limiting middleware (simple in-memory implementation)
// In production, use a more robust solution like express-rate-limit
const requestCounts = new Map();
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 100; // 100 requests per window

export const rateLimit = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  // Clean up old entries
  for (const [key, value] of requestCounts.entries()) {
    if (now - value.timestamp > WINDOW_MS) {
      requestCounts.delete(key);
    }
  }
  
  // Get current count for this IP
  const current = requestCounts.get(ip) || { count: 0, timestamp: now };
  
  // If this is a new window, reset count
  if (now - current.timestamp > WINDOW_MS) {
    current.count = 0;
    current.timestamp = now;
  }
  
  // Increment count
  current.count += 1;
  requestCounts.set(ip, current);
  
  // Check if over limit
  if (current.count > MAX_REQUESTS) {
    return res.status(429).json({
      error: 'Too many requests, please try again later',
      retryAfter: Math.ceil((current.timestamp + WINDOW_MS - now) / 1000)
    });
  }
  
  // Add rate limit headers
  res.setHeader('X-RateLimit-Limit', MAX_REQUESTS);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, MAX_REQUESTS - current.count));
  res.setHeader('X-RateLimit-Reset', Math.ceil((current.timestamp + WINDOW_MS) / 1000));
  
  next();
};
