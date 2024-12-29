import { useState, useEffect, useCallback } from 'react';

const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export const useBreakpoint = () => {
  // Initialize with SSR-safe defaults
  const [breakpoint, setBreakpoint] = useState(() => ({
    isMobile: false,
    isTablet: false,
    isDesktop: true, // Default to desktop for SSR
    width: typeof window !== 'undefined' ? window.innerWidth : undefined
  }));

  // Memoize the resize calculation to prevent recreating on every render
  const calculateBreakpoint = useCallback((width) => {
    try {
      return {
        isMobile: width < breakpoints.md,
        isTablet: width >= breakpoints.md && width < breakpoints.lg,
        isDesktop: width >= breakpoints.lg,
        width
      };
    } catch (error) {
      console.error('Error calculating breakpoint:', error);
      // Return safe defaults on error
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        width: undefined
      };
    }
  }, []);

  useEffect(() => {
    // Return early if window is not defined (SSR)
    if (typeof window === 'undefined') return;

    let timeoutId;
    
    const handleResize = () => {
      // Clear existing timeout
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }

      // Debounce resize events
      timeoutId = window.setTimeout(() => {
        try {
          const width = window.innerWidth;
          if (typeof width !== 'number' || isNaN(width)) {
            throw new Error('Invalid width value');
          }
          setBreakpoint(calculateBreakpoint(width));
        } catch (error) {
          console.error('Error handling resize:', error);
          // Set safe defaults on error
          setBreakpoint({
            isMobile: false,
            isTablet: false,
            isDesktop: true,
            width: undefined
          });
        }
      }, 100); // 100ms debounce delay
    };

    // Initial calculation
    handleResize();

    // Add event listener with error handling
    try {
      window.addEventListener('resize', handleResize, { passive: true });
    } catch (error) {
      console.error('Error adding resize listener:', error);
    }

    // Cleanup
    return () => {
      try {
        if (timeoutId) {
          window.clearTimeout(timeoutId);
        }
        window.removeEventListener('resize', handleResize);
      } catch (error) {
        console.error('Error cleaning up resize listener:', error);
      }
    };
  }, [calculateBreakpoint]);

  // Add a safety check for the returned width
  const safeBreakpoint = {
    ...breakpoint,
    width: typeof breakpoint.width === 'number' && !isNaN(breakpoint.width) 
      ? breakpoint.width 
      : undefined
  };

  return safeBreakpoint;
};