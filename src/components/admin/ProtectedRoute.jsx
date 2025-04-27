// src/components/admin/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const location = useLocation();
  const { isAuthenticated, verifyToken, loading: authLoading } = useAuth();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // If we're already authenticated via context, we're good
        if (isAuthenticated) {
          setAuthenticated(true);
          setLoading(false);
          return;
        }
        
        // Double-check by verifying the token
        const isValid = await verifyToken();
        setAuthenticated(isValid);
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
  }, [isAuthenticated, verifyToken, authLoading]);

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

  if (!authenticated) {
    // Redirect to login page if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Render children if authenticated
  return children;
};

export default ProtectedRoute;