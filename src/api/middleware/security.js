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
  
  // Cache-Control for API responses (exclude eBay endpoint which has its own headers)
  if (req.path.startsWith('/api/') && req.method === 'GET' && !req.path.includes('/partsmatrix')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  
  next();
};

// Rate limiting middleware (simple in-memory implementation)
// In production, use a more robust solution like express-rate-limit
const requestCounts = new Map();
const authRequestCounts = new Map();
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 200; // Increased from 100 to 200 requests per window
const AUTH_WINDOW_MS = 2 * 60 * 1000; // Increased from 1 to 2 minutes for auth endpoints
const MAX_AUTH_REQUESTS = 20; // Increased from 10 to 20 auth requests per 2 minutes

export const rateLimit = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const isAuthEndpoint = req.path.includes('/auth/refresh') || req.path.includes('/auth/login');
  
  // Note: Rate limiting active for all environments
  
  // Use different rate limits for auth endpoints
  const counts = isAuthEndpoint ? authRequestCounts : requestCounts;
  const windowMs = isAuthEndpoint ? AUTH_WINDOW_MS : WINDOW_MS;
  const maxRequests = isAuthEndpoint ? MAX_AUTH_REQUESTS : MAX_REQUESTS;
  
  // Clean up old entries
  for (const [key, value] of counts.entries()) {
    if (now - value.timestamp > windowMs) {
      counts.delete(key);
    }
  }
  
  // Get current count for this IP
  const current = counts.get(ip) || { count: 0, timestamp: now };
  
  // If this is a new window, reset count
  if (now - current.timestamp > windowMs) {
    current.count = 0;
    current.timestamp = now;
  }
  
  // Increment count
  current.count += 1;
  counts.set(ip, current);
  
  // Check if over limit
  if (current.count > maxRequests) {
    const retryAfter = Math.ceil((current.timestamp + windowMs - now) / 1000);
    console.warn(`Rate limit exceeded for ${isAuthEndpoint ? 'auth' : 'general'} endpoint:`, {
      ip,
      path: req.path,
      count: current.count,
      limit: maxRequests,
      retryAfter
    });
    
    return res.status(429).json({
      error: 'Too many requests, please try again later',
      retryAfter
    });
  }
  
  // Add rate limit headers
  res.setHeader('X-RateLimit-Limit', maxRequests);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - current.count));
  res.setHeader('X-RateLimit-Reset', Math.ceil((current.timestamp + windowMs) / 1000));
  
  next();
};
