// src/api/routes/Auth.js
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/UserModel.js';

const router = Router();

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find user
    const user = await User.findOne({ username, active: true });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'phoenix_automotive_default_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
    
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Verify token endpoint (useful for checking if token is still valid)
router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ valid: false });
    }
    
    jwt.verify(token, process.env.JWT_SECRET || 'phoenix_automotive_default_secret', async (err, decoded) => {
      if (err) {
        return res.status(401).json({ valid: false });
      }
      
      // Check if user still exists and is active
      const user = await User.findById(decoded.id).select('-password');
      if (!user || !user.active) {
        return res.status(401).json({ valid: false });
      }
      
      res.json({ 
        valid: true,
        user: {
          id: user._id,
          username: user.username,
          role: user.role
        }
      });
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ valid: false });
  }
});

export default router;
