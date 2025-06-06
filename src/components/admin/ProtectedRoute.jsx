// src/components/admin/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { jwtDecode } from 'jwt-decode';

// Session timeout in minutes
const SESSION_TIMEOUT = 15;
const INACTIVITY_WARNING = 13; // Show warning after 13 minutes of inactivity
// Warning duration will be SESSION_TIMEOUT - INACTIVITY_WARNING = 2 minutes

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [showTimeout, setShowTimeout] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const location = useLocation();
  const lastActivityRef = useRef(Date.now());
  const timeoutIdRef = useRef(null);
  const warningIdRef = useRef(null);
  
  const { 
    isAuthenticated, 
    verifyToken, 
    refreshToken,
    token,
    loading: authLoading,
    logout
  } = useAuth();

  // Function to handle user activity
  const handleUserActivity = () => {
    lastActivityRef.current = Date.now();
    
    // Reset timeout warning if shown
    if (showTimeout) {
      setShowTimeout(false);
      setupSessionTimeout();
    }
  };

  // Function to setup session timeout
  const setupSessionTimeout = () => {
    // Clear existing timeouts
    if (timeoutIdRef.current) {
      console.log('Clearing existing timeout');
      clearTimeout(timeoutIdRef.current);
    }
    if (warningIdRef.current) {
      console.log('Clearing existing warning timeout');
      clearTimeout(warningIdRef.current);
    }

    // Debug log
    console.log('Setting up new session timeout, warning after', INACTIVITY_WARNING, 'minutes');

    // Set warning timeout to appear after inactivity
    // Cast to milliseconds, minutes * 60 seconds * 1000 milliseconds
    const warningDelay = INACTIVITY_WARNING * 60 * 1000;
    warningIdRef.current = setTimeout(() => {
      console.log('Showing timeout warning');
      setShowTimeout(true);
      
      // Start countdown - The user has 5 minutes to act
      const warningDuration = (SESSION_TIMEOUT - INACTIVITY_WARNING) * 60;
      let countdown = warningDuration;
      setTimeRemaining(countdown);
      
      // Set up countdown interval
      const countdownInterval = setInterval(() => {
        countdown -= 1;
        setTimeRemaining(countdown);
        
        if (countdown <= 0) {
          console.log('Countdown reached zero');
          clearInterval(countdownInterval);
        }
      }, 1000);
      
      // Set actual logout timeout
      timeoutIdRef.current = setTimeout(() => {
        console.log('Session timeout reached, logging out');
        logout();
        setAuthenticated(false);
        // Force redirect to login page
        window.location.href = '/login';
      }, warningDuration * 1000);
      
    }, warningDelay);
  };

  // Function to extend session
  const extendSession = async () => {
    try {
      console.log('Attempting to extend session...');
      const newToken = await refreshToken();
      
      // Reset the timer and hide warning
      setShowTimeout(false);
      lastActivityRef.current = Date.now();
      
      if (newToken) {
        console.log('Session extended successfully');
        setAuthenticated(true); // Ensure authenticated state is updated
        setupSessionTimeout();
      } else {
        console.warn('Token refresh failed - will try again');
        // Don't immediately logout on failed refresh
        // Instead set a short timeout to try verifying token again
        setTimeout(async () => {
          const valid = await verifyToken();
          if (!valid) {
            console.warn('Could not verify token after refresh attempt, logging out');
            logout();
            window.location.href = '/login';
          } else {
            console.log('Token verified after refresh attempt');
            setupSessionTimeout();
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Error extending session:', error);
      // Add retry mechanism instead of immediately logging out
      setTimeout(async () => {
        try {
          const valid = await verifyToken();
          if (valid) {
            console.log('Token verified after error recovery');
            setShowTimeout(false);
            setupSessionTimeout();
          } else {
            logout();
            window.location.href = '/login';
          }
        } catch (retryError) {
          console.error('Retry failed:', retryError);
          logout();
          window.location.href = '/login';
        }
      }, 2000);
    }
  };

  // Handle session expiry based on token expiry
  useEffect(() => {
    if (!token) return;
    
    try {
      const decoded = jwtDecode(token);
      const expiresAt = decoded.exp * 1000; // Convert to milliseconds
      const timeUntilExpiry = expiresAt - Date.now();
      
      // Only show warning if token expires soon AND more than 1 minute remaining
      // This prevents immediate warnings after login
      if (timeUntilExpiry < INACTIVITY_WARNING * 60 * 1000 && timeUntilExpiry > 60000) {
        console.log('Token will expire soon, showing warning');
        setShowTimeout(true);
        setTimeRemaining(Math.floor(timeUntilExpiry / 1000));
      }
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  }, [token]);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // If we're already authenticated via context, we're good
        if (isAuthenticated) {
          setAuthenticated(true);
          setLoading(false);
          
          // Setup session timeout
          setupSessionTimeout();
          return;
        }
        
        // Double-check by verifying the token
        const isValid = await verifyToken();
        setAuthenticated(isValid);
        
        if (isValid) {
          // Setup session timeout
          setupSessionTimeout();
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    
    // Only run check if the auth context is done loading
    if (!authLoading) {
      checkAuth();
    }
    
    return () => {
      // Clear timeouts on unmount
      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
      if (warningIdRef.current) clearTimeout(warningIdRef.current);
    };
  }, [isAuthenticated, verifyToken, authLoading]);

  // Set up activity tracking
  useEffect(() => {
    // Track user activity
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll', 'mousemove'];
    
    const trackActivity = () => {
      // Only update if it's been at least 5 seconds since last activity update
      // This prevents excessive updates
      if (Date.now() - lastActivityRef.current > 5000) {
        handleUserActivity();
      }
    };
    
    events.forEach(event => {
      window.addEventListener(event, trackActivity, { passive: true });
    });
    
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, trackActivity);
      });
    };
  }, []);

  if (loading) {
    // Show loading screen while checking authentication
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-gray-500" />
          <p className="mt-4 text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (showTimeout) {
    // Show session timeout warning
    return (
      <div 
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
        onClick={(e) => {
          // Prevent click events from bubbling up and accidentally closing the modal
          e.stopPropagation();
          // Only handle clicks directly on the backdrop (not on child elements)
          if (e.target === e.currentTarget) {
            // Handle click outside of modal - extend session
            extendSession();
          }
        }}
      >
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Session Timeout Warning</h2>
            <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
              {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')}
            </div>
          </div>
          
          <p className="mb-4 text-gray-600">
            For your security, this admin session has a 15-minute inactivity timer. 
            Click "Continue Session" to reset this timer, or your session will expire soon.
          </p>
          <p className="mb-4 text-gray-600">
            The timer resets automatically when you interact with the system. This warning appears 
            after 13 minutes of inactivity.
          </p>
          
          <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4 sm:justify-end">
            <button
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 text-gray-700 font-medium transition-colors"
              onClick={() => {
                logout();
                // Navigate to login after logout
                window.location.href = '/login';
              }}
            >
              Logout Now
            </button>
            <button
              className="px-4 py-2 bg-red-700 text-white rounded-md hover:bg-red-800 font-medium transition-colors shadow-sm"
              onClick={(e) => {
                e.preventDefault(); // Prevent any other handlers from firing
                e.stopPropagation(); // Stop propagation to parent elements
                extendSession();
              }}
            >
              Continue Session
            </button>
          </div>
          
          <div className="mt-4 text-xs text-gray-500 text-center">
            For security reasons, your session will automatically expire after 15 minutes of inactivity.
            You can also manually refresh your session at any time by clicking the refresh icon in the top right corner.
          </div>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    // Redirect to login page if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Render children if authenticated
  return children;
};

export default ProtectedRoute;