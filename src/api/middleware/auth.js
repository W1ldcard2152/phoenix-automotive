// src/api/middleware/auth.js
import jwt from 'jsonwebtoken';
import { User } from '../models/UserModel.js';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      console.warn('Authentication failed: No token provided', {
        path: req.path,
        method: req.method,
        ip: req.ip
      });
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'phoenix_automotive_default_secret');
      
      // Check if user still exists and is active
      const user = await User.findById(decoded.id);
      if (!user) {
        console.warn('Authentication failed: User not found', {
          userId: decoded.id,
          path: req.path
        });
        return res.status(403).json({ error: 'Access denied. User not found.' });
      }
      
      if (!user.active) {
        console.warn('Authentication failed: User not active', {
          userId: decoded.id,
          username: user.username,
          path: req.path
        });
        return res.status(403).json({ error: 'Access denied. User no longer active.' });
      }
      
      // Check token expiration explicitly
      const currentTimestamp = Math.floor(Date.now() / 1000);
      if (decoded.exp && decoded.exp < currentTimestamp) {
        console.warn('Authentication failed: Token expired', {
          userId: decoded.id,
          expiry: new Date(decoded.exp * 1000).toISOString(),
          now: new Date().toISOString()
        });
        return res.status(401).json({ 
          error: 'Token expired',
          shouldRefresh: true
        });
      }
      
      req.user = decoded;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        console.warn('Authentication failed: Token expired', {
          error: error.message,
          expiry: error.expiredAt
        });
        return res.status(401).json({ 
          error: 'Token expired',
          shouldRefresh: true
        });
      } else if (error.name === 'JsonWebTokenError') {
        console.warn('Authentication failed: Invalid token', {
          error: error.message,
          path: req.path
        });
        return res.status(403).json({ error: 'Invalid token' });
      }
      throw error;
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};
