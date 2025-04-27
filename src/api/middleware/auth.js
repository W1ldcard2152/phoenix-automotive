// src/api/middleware/auth.js
import jwt from 'jsonwebtoken';
import { User } from '../models/UserModel.js';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'phoenix_automotive_default_secret');
      
      // Check if user still exists and is active
      const user = await User.findById(decoded.id);
      if (!user || !user.active) {
        return res.status(403).json({ error: 'Access denied. User no longer active.' });
      }
      
      // Check token expiration explicitly
      const currentTimestamp = Math.floor(Date.now() / 1000);
      if (decoded.exp && decoded.exp < currentTimestamp) {
        return res.status(401).json({ error: 'Token expired' });
      }
      
      req.user = decoded;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired' });
      } else if (error.name === 'JsonWebTokenError') {
        return res.status(403).json({ error: 'Invalid token' });
      }
      throw error;
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};
