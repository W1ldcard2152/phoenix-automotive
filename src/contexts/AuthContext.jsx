import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

// Global refresh promise to prevent multiple simultaneous refreshes across component instances
let globalRefreshPromise = null;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tokenExpiry, setTokenExpiry] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

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
    // Check if there's already a global refresh in progress
    if (globalRefreshPromise) {
      console.log('Waiting for existing refresh to complete...');
      return globalRefreshPromise;
    }
    
    // Create a new refresh promise
    globalRefreshPromise = (async () => {
      try {
        setRefreshing(true);
        console.log('Starting token refresh...');
      
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include' // Include cookies
      });

      // Check if response was actually successful before handling the data
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Token refresh failed:', errorText);
        
        // Handle rate limiting specifically
        if (response.status === 429) {
          const errorData = JSON.parse(errorText);
          const retryAfter = errorData.retryAfter || 60;
          console.warn(`Rate limited. Will retry in ${retryAfter} seconds`);
          
          // Schedule a retry after the specified time
          setTimeout(() => {
            console.log('Retrying token refresh after rate limit...');
            globalRefreshPromise = null; // Clear the promise so retry can proceed
            refreshToken().catch(error => {
              console.error('Retry after rate limit failed:', error);
            });
          }, retryAfter * 1000);
          
          throw new Error(`Rate limited. Retrying in ${retryAfter} seconds`);
        }
        
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      
      // Update state
      setToken(data.accessToken);
      localStorage.setItem('authToken', data.accessToken);
      
      // Update token expiry and user data
      try {
        const decoded = jwtDecode(data.accessToken);
        setTokenExpiry(decoded.exp * 1000); // Convert to milliseconds
        
        // Update user data if available in response
        if (data.user) {
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
        }
      } catch (error) {
        console.error('Failed to decode token expiry:', error);
      }
        
        return data.accessToken;
      } catch (error) {
        console.error('Token refresh error:', error);
        // Don't logout automatically on refresh failure
        return null;
      } finally {
        setRefreshing(false);
        // Clear the global promise so future refreshes can proceed
        globalRefreshPromise = null;
      }
    })();
    
    return globalRefreshPromise;
  }, []);

  // Initialize auth state - simplified
  useEffect(() => {
    const initialize = async () => {
      console.log('Initializing auth state...');
      setLoading(true);
      
      try {
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
              console.log('Stored token is expired, clearing it');
              // Clear expired tokens instead of trying to refresh during initialization
              localStorage.removeItem('authToken');
              localStorage.removeItem('user');
              setToken(null);
              setUser(null);
              setTokenExpiry(null);
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
  }, []); // Remove refreshToken dependency to prevent cascade

  // Login function - simplified
  const login = async (username, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
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
            'Authorization': `Bearer ${token}`
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

  // Verify token function - optimized to reduce refresh triggers
  const verifyToken = async () => {
    if (!token) return false;
    
    // Check if token is expired locally first
    if (isTokenExpired(token)) {
      console.log('Token expired locally - returning false (let automatic refresh handle it)');
      return false; // Don't trigger refresh here - let the automatic timer handle it
    }
    
    try {
      const response = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        console.log('Token verification failed with status:', response.status);
        // Only refresh on 401/403, not on network errors
        if (response.status === 401 || response.status === 403) {
          const newToken = await refreshToken();
          return !!newToken;
        }
        return false;
      }
      
      // Parse response safely
      let data;
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          // Non-JSON response, assume invalid but don't refresh
          console.warn('Non-JSON response from verify endpoint');
          return false;
        }
      } catch (parseError) {
        console.error('Error parsing verify response:', parseError);
        return false; // Don't refresh on parse errors
      }
      
      if (!data.valid) {
        console.log('Token marked as invalid by server');
        // Only refresh if server explicitly says token is invalid
        const newToken = await refreshToken();
        return !!newToken;
      }
      
      // Update user data if returned
      if (data.user) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      
      return true;
    } catch (error) {
      console.error('Token verification error:', error);
      
      // Only logout on critical auth errors, not network issues
      if (error.message && (error.message.includes('Invalid token') || 
          error.message.includes('Token has been revoked'))) {
        console.log('Critical token error, logging out');
        await logout();
        return false;
      }
      
      // For network errors, just return false (don't refresh)
      return false;
    }
  };
  
  // Set up token refresh interval
  useEffect(() => {
    if (!token || !tokenExpiry) return;
    
    // Calculate time until refresh (5 minutes before expiry)
    const timeUntilRefresh = tokenExpiry - Date.now() - (5 * 60 * 1000); 
    console.log('Time until token refresh:', Math.floor(timeUntilRefresh / 1000 / 60), 'minutes');
    
    // If timeUntilRefresh is negative, refresh immediately (but don't await to prevent blocking)
    if (timeUntilRefresh <= 0) {
      console.log('Token expiring soon or already expired, refreshing immediately');
      refreshToken().catch(error => {
        console.error('Scheduled token refresh failed:', error);
      });
      return;
    }
    
    // Ensure the refresh interval is at least 1 second but no more than 30 minutes
    const refreshInterval = Math.max(1000, Math.min(timeUntilRefresh, 30 * 60 * 1000));
    console.log('Setting token refresh in', Math.floor(refreshInterval / 1000 / 60), 'minutes');
    
    const intervalId = setTimeout(() => {
      console.log('Refreshing token on schedule');
      refreshToken().catch(error => {
        console.error('Scheduled token refresh failed:', error);
      });
    }, refreshInterval);
    
    return () => {
      console.log('Clearing token refresh timer');
      clearTimeout(intervalId);
    };
  }, [token, tokenExpiry]); // Remove refreshToken dependency to prevent cascade

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    loading,
    login,
    logout,
    verifyToken,
    refreshToken
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