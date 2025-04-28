// src/api/routes/Auth.js
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/UserModel.js';
import { authenticateToken } from '../middleware/auth.js';
import { generateCsrfToken } from '../middleware/csrf.js';

const router = Router();

// Helper function to generate tokens
const generateTokens = (user) => {
  // Access token (short-lived)
  const accessToken = jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    process.env.JWT_SECRET || 'phoenix_automotive_default_secret',
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
  );
  
  // Refresh token (long-lived)
  const refreshToken = jwt.sign(
    { id: user._id, tokenVersion: user.tokenVersion || 0 },
    process.env.JWT_REFRESH_SECRET || 'phoenix_automotive_refresh_secret',
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
  
  return { accessToken, refreshToken };
};

// Login endpoint with rate limiting
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    // Find user
    const user = await User.findOne({ username });
    
    // If user not found or inactive, return generic error
    if (!user || !user.active) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    try {
      // Compare password - will throw error if account is locked
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        // Invalid password - already handled in comparePassword method
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Update last login
      user.lastLogin = new Date();
      await user.save();
    } catch (error) {
      // Handle locked account error
      if (error.message.includes('Account is temporarily locked')) {
        return res.status(429).json({ 
          error: 'Account is temporarily locked due to multiple failed login attempts. Please try again later.' 
        });
      }
      throw error;
    }
    
    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);
    
    // Set refresh token as HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    res.json({
      token: accessToken, // For backward compatibility
      accessToken,
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      },
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m'
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

// Refresh token endpoint
router.post('/refresh', async (req, res) => {
  try {
    // Get refresh token from cookie
    const refreshToken = req.cookies?.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({ error: 'No refresh token provided' });
    }
    
    // Verify refresh token
    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'phoenix_automotive_refresh_secret', async (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid refresh token' });
      }
      
      try {
        // Get user
        const user = await User.findById(decoded.id);
        
        if (!user || !user.active) {
          return res.status(403).json({ error: 'User not found or inactive' });
        }
        
        // Check token version (allows invalidating all refresh tokens)
        if (user.tokenVersion !== decoded.tokenVersion) {
          return res.status(403).json({ error: 'Token has been revoked' });
        }
        
        // Generate new tokens
        const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);
        
        // Set new refresh token
        res.cookie('refreshToken', newRefreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        
        // Return new access token
        res.json({ 
          accessToken,
          user: {
            id: user._id,
            username: user.username,
            role: user.role
          },
          expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m'
        });
      } catch (error) {
        console.error('Refresh token error:', error);
        res.status(500).json({ error: 'Server error during token refresh' });
      }
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

// Logout endpoint - invalidate the refresh token
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // Clear refresh token cookie
    res.clearCookie('refreshToken');
    
    // Update token version to invalidate all existing refresh tokens
    const user = await User.findById(req.user.id);
    if (user) {
      user.tokenVersion = (user.tokenVersion || 0) + 1;
      await user.save();
    }
    
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Failed to logout' });
  }
});

// Password change endpoint
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Validate inputs
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required' });
    }
    
    // Password strength validation
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }
    
    // Check if new password has a good strength (simple check)
    const hasNumber = /\d/.test(newPassword);
    const hasUpper = /[A-Z]/.test(newPassword);
    const hasLower = /[a-z]/.test(newPassword);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
    
    if (!(hasNumber && hasUpper && hasLower && hasSpecial)) {
      return res.status(400).json({
        error: 'Password must contain at least: one number, one uppercase letter, one lowercase letter, and one special character'
      });
    }
    
    // Get user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    try {
      // Change password using model method
      await user.changePassword(currentPassword, newPassword);
      
      // Invalidate tokens by clearing refresh token cookie
      res.clearCookie('refreshToken');
      
      // Generate new tokens
      const { accessToken, refreshToken } = generateTokens(user);
      
      // Set new refresh token
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      
      res.json({
        success: true,
        message: 'Password changed successfully',
        accessToken
      });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// CSRF token endpoint
router.get('/csrf', (req, res) => {
  try {
    // Generate a new CSRF token
    const token = generateCsrfToken();
    
    // Set as cookie - needs to be accessible by JavaScript
    res.cookie('csrfToken', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('CSRF token generation error:', error);
    res.status(500).json({ error: 'Failed to generate CSRF token' });
  }
});

export default router;
