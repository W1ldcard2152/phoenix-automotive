import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { getCsrfToken, generateCsrfToken } from '../utils/csrfUtils';

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
      
      // Always ensure we have a CSRF token
      const currentCsrfToken = csrfToken || generateCsrfToken();
      
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': currentCsrfToken
        },
        credentials: 'include' // Include cookies
      });

      // Check if response was actually successful before handling the data
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Token refresh failed:', errorText);
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
      // This allows retry mechanisms to work
      return null;
    } finally {
      setRefreshing(false);
    }
  }, [refreshing, token, csrfToken]);

  // Initialize auth state and get CSRF token from cookie
  useEffect(() => {
    const initialize = async () => {
      console.log('Initializing auth state...');
      setLoading(true);
      
      try {
        // Debug cookies function
        const debugCookies = () => {
          console.log('Document cookies:', document.cookie);
          try {
            const allCookies = document.cookie.split(';').map(cookie => cookie.trim());
            console.log('All cookies:', allCookies);
          } catch (e) {
            console.error('Error reading cookies:', e);
          }
        };
        
        // Debug cookies
        debugCookies();
        
        // Get CSRF token from cookie
        const getCookieValue = (name) => {
          const value = `; ${document.cookie}`;
          const parts = value.split(`; ${name}=`);
          if (parts.length === 2) return parts.pop().split(';').shift();
          return null;
        };
        
        const cookieCsrfToken = getCookieValue('csrfToken');
        console.log('Initial CSRF token from cookie:', cookieCsrfToken ? 'present' : 'missing');
        
        // Generate fallback token first - we'll use this regardless
        const fallbackToken = generateCsrfToken();
        setCsrfToken(fallbackToken);
        console.log('Set fallback CSRF token:', fallbackToken.substring(0, 5) + '...');
        
        // Try to fetch from server, but don't block on it
        try {
          const abortController = new AbortController();
          const timeoutId = setTimeout(() => abortController.abort(), 3000);
          
          console.log('Fetching CSRF token from server...');
          fetch('/api/auth/csrf', { 
            method: 'GET', 
            credentials: 'include',
            signal: abortController.signal
          }).then(response => {
            clearTimeout(timeoutId);
            if (response.ok) {
              console.log('CSRF token fetch response:', response.status);
              // Check cookies again after fetch
              debugCookies();
              
              // Check if we got a token in the cookie after fetch
              const newToken = getCookieValue('csrfToken');
              if (newToken && newToken !== fallbackToken) {
                console.log('Received server CSRF token, updating');
                setCsrfToken(newToken);
              }
            }
          }).catch(err => {
            clearTimeout(timeoutId);
            console.warn('CSRF fetch failed, using fallback token:', err.message);
            // We already set the fallback token, so just log the error
          });
        } catch (error) {
          console.error('Failed to get CSRF token:', error);
          // We already have the fallback token set
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
        // Use a fallback token if anything fails
        const emergencyToken = generateCsrfToken();
        setCsrfToken(emergencyToken);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [isTokenExpired, refreshToken]);

  // Login function
  const login = async (username, password) => {
    try {
      // Ensure we have a CSRF token
      const currentCsrfToken = csrfToken || generateCsrfToken();
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': currentCsrfToken
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
            'X-CSRF-Token': csrfToken || generateCsrfToken()
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
      console.log('Token expired locally, attempting refresh');
      // Try to refresh the token
      const newToken = await refreshToken();
      return !!newToken;
    }
    
    try {
      // Ensure we have a CSRF token
      const currentCsrfToken = csrfToken || generateCsrfToken();
      
      const response = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-CSRF-Token': currentCsrfToken
        },
        credentials: 'include' // Include cookies
      });
      
      // Handle non-JSON responses gracefully
      let data;
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          console.warn('Non-JSON response from verify endpoint, attempting refresh');
          const newToken = await refreshToken();
          return !!newToken;
        }
      } catch (parseError) {
        console.error('Error parsing verify response:', parseError);
        const newToken = await refreshToken();
        return !!newToken;
      }
      
      if (!response.ok || !data.valid) {
        console.log('Token failed verification, attempting refresh');
        // Try to refresh the token if verification fails
        const newToken = await refreshToken();
        return !!newToken;
      }
      
      // Update user data if it was returned
      if (data.user) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      
      return true;
    } catch (error) {
      console.error('Token verification error:', error);
      // Try refresh on network errors instead of failing immediately
      try {
        console.log('Attempting token refresh after verification error');
        const newToken = await refreshToken();
        if (newToken) {
          console.log('Successfully refreshed token after verification error');
          return true;
        }
      } catch (refreshError) {
        console.error('Refresh after verification error failed:', refreshError);
      }
      
      // Only logout on critical errors, not network issues
      if (error.message && (error.message.includes('Invalid token') || 
          error.message.includes('Token has been revoked'))) {
        console.log('Critical token error, logging out');
        await logout();
        return false;
      }
      
      // For other errors (like network issues), don't log out
      // Just return false to indicate verification failed
      return false;
    }
  };
  
  // Function to change password
  const changePassword = async (currentPassword, newPassword) => {
    if (!token) throw new Error('Not authenticated');
    
    try {
      // Ensure we have a CSRF token
      const currentCsrfToken = csrfToken || generateCsrfToken();
      
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-CSRF-Token': currentCsrfToken
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
    
    // Calculate time until refresh (5 minutes before expiry)
    const timeUntilRefresh = tokenExpiry - Date.now() - (5 * 60 * 1000); 
    console.log('Time until token refresh:', Math.floor(timeUntilRefresh / 1000 / 60), 'minutes');
    
    // If timeUntilRefresh is negative, refresh immediately
    if (timeUntilRefresh <= 0) {
      console.log('Token expiring soon or already expired, refreshing immediately');
      refreshToken();
      return;
    }
    
    // Ensure the refresh interval is at least 1 second but no more than 30 minutes
    const refreshInterval = Math.max(1000, Math.min(timeUntilRefresh, 30 * 60 * 1000));
    console.log('Setting token refresh in', Math.floor(refreshInterval / 1000 / 60), 'minutes');
    
    const intervalId = setTimeout(() => {
      console.log('Refreshing token on schedule');
      refreshToken();
    }, refreshInterval);
    
    return () => {
      console.log('Clearing token refresh timer');
      clearTimeout(intervalId);
    };
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