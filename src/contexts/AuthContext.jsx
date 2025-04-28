import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode'; // Make sure to add this package

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tokenExpiry, setTokenExpiry] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [csrfToken, setCsrfToken] = useState('');

  // Function to check if token is expired or expiring soon
  const isTokenExpired = useCallback((token) => {
    if (!token) return true;

    try {
      const decoded = jwtDecode(token);
      // Check if token is expired or will expire in the next 5 minutes
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime + 300; // 300 seconds = 5 minutes
    } catch (error) {
      console.error('Token decode error:', error);
      return true;
    }
  }, []);

  // Function to refresh the token
  const refreshToken = useCallback(async () => {
    if (refreshing) return token;
    
    try {
      setRefreshing(true);
      
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        credentials: 'include' // Include cookies
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      
      // Update state
      setToken(data.accessToken);
      localStorage.setItem('authToken', data.accessToken);
      
      // Update token expiry
      try {
        const decoded = jwtDecode(data.accessToken);
        setTokenExpiry(decoded.exp * 1000); // Convert to milliseconds
      } catch (error) {
        console.error('Failed to decode token expiry:', error);
      }
      
      return data.accessToken;
    } catch (error) {
      console.error('Token refresh error:', error);
      logout();
      return null;
    } finally {
      setRefreshing(false);
    }
  }, [refreshing, token, csrfToken]);

  // Initialize auth state and get CSRF token from cookie
  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      
      try {
        // Get CSRF token from cookie
        const getCookie = (name) => {
          const value = `; ${document.cookie}`;
          const parts = value.split(`; ${name}=`);
          if (parts.length === 2) return parts.pop().split(';').shift();
          return null;
        };
        
        const cookieCsrfToken = getCookie('csrfToken');
        
        // If no CSRF token in cookie, make a GET request to the server to set one
        if (!cookieCsrfToken) {
          try {
            await fetch('/api/auth/csrf', { method: 'GET', credentials: 'include' });
            const newCsrfToken = getCookie('csrfToken');
            if (newCsrfToken) {
              setCsrfToken(newCsrfToken);
            } else {
              console.warn('Failed to get CSRF token from server');
              // Fallback method if server doesn't set the cookie
              const fallbackToken = Math.random().toString(36).substring(2, 15) + 
                                 Math.random().toString(36).substring(2, 15);
              setCsrfToken(fallbackToken);
            }
          } catch (error) {
            console.error('Failed to get CSRF token:', error);
            // Fallback method
            const fallbackToken = Math.random().toString(36).substring(2, 15) + 
                               Math.random().toString(36).substring(2, 15);
            setCsrfToken(fallbackToken);
          }
        } else {
          setCsrfToken(cookieCsrfToken);
        }
        
        // Get stored token
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('user');
        
        if (storedToken && storedUser) {
          try {
            // Check if token is valid
            if (!isTokenExpired(storedToken)) {
              setToken(storedToken);
              setUser(JSON.parse(storedUser));
              
              // Set token expiry
              const decoded = jwtDecode(storedToken);
              setTokenExpiry(decoded.exp * 1000);
            } else {
              // Try to refresh the token
              await refreshToken();
            }
          } catch (error) {
            console.error('Error parsing stored auth data:', error);
            // Clear invalid data
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [isTokenExpired, refreshToken]);

  // Login function
  const login = async (username, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        credentials: 'include', // Include cookies
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Login failed');
      }

      const data = await response.json();
      
      // Save to state
      setToken(data.accessToken || data.token); // Support both formats
      setUser(data.user);
      
      // Set token expiry
      try {
        const decoded = jwtDecode(data.accessToken || data.token);
        setTokenExpiry(decoded.exp * 1000);
      } catch (error) {
        console.error('Failed to decode token expiry:', error);
      }
      
      // Save to localStorage
      localStorage.setItem('authToken', data.accessToken || data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      if (token) {
        // Call the logout API to invalidate tokens on the server
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'X-CSRF-Token': csrfToken
          },
          credentials: 'include' // Include cookies
        }).catch(error => {
          console.error('Logout API error:', error);
          // Continue with local logout even if API call fails
        });
      }
    } finally {
      // Clear state
      setToken(null);
      setUser(null);
      setTokenExpiry(null);
      
      // Clear localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  };

  // Verify token function
  const verifyToken = async () => {
    if (!token) return false;
    
    // Check if token is expired locally first
    if (isTokenExpired(token)) {
      // Try to refresh the token
      const newToken = await refreshToken();
      return !!newToken;
    }
    
    try {
      const response = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-CSRF-Token': csrfToken
        },
        credentials: 'include' // Include cookies
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.valid) {
        // Try to refresh the token if verification fails
        const newToken = await refreshToken();
        return !!newToken;
      }
      
      return true;
    } catch (error) {
      console.error('Token verification error:', error);
      await logout();
      return false;
    }
  };
  
  // Function to change password
  const changePassword = async (currentPassword, newPassword) => {
    if (!token) throw new Error('Not authenticated');
    
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-CSRF-Token': csrfToken
        },
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to change password');
      }
      
      const data = await response.json();
      
      // Update token if a new one is provided
      if (data.accessToken) {
        setToken(data.accessToken);
        localStorage.setItem('authToken', data.accessToken);
        
        // Update token expiry
        try {
          const decoded = jwtDecode(data.accessToken);
          setTokenExpiry(decoded.exp * 1000);
        } catch (error) {
          console.error('Failed to decode token expiry:', error);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Password change error:', error);
      throw error;
    }
  };

  // Set up token refresh interval
  useEffect(() => {
    if (!token || !tokenExpiry) return;
    
    const timeUntilRefresh = tokenExpiry - Date.now() - (5 * 60 * 1000); // Refresh 5 min before expiry
    const refreshInterval = Math.max(1000, timeUntilRefresh); // Min 1 second
    
    const intervalId = setTimeout(() => {
      refreshToken();
    }, refreshInterval);
    
    return () => clearTimeout(intervalId);
  }, [token, tokenExpiry, refreshToken]);

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    loading,
    login,
    logout,
    verifyToken,
    refreshToken,
    changePassword,
    csrfToken
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;