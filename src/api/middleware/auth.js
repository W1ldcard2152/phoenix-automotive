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
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'phoenix_automotive_default_secret');
    
    // Check if user still exists and is active
    const user = await User.findById(decoded.id);
    if (!user || !user.active) {
      return res.status(403).json({ error: 'Access denied. User no longer active.' });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    res.status(403).json({ error: 'Invalid token' });
  }
};
