// src/components/layout/ResponsiveGrid.jsx
import React from 'react';
import { useBreakpoint } from '@/hooks/useBreakpoint';

export const ResponsiveGrid = ({
  children,
  mobileClassName = "grid grid-cols-1 gap-4",
  tabletClassName = "grid grid-cols-2 gap-6",
  desktopClassName = "grid grid-cols-3 gap-6",
}) => {
  const { isMobile, isTablet } = useBreakpoint();
  
  const className = isMobile 
    ? mobileClassName 
    : isTablet 
    ? tabletClassName 
    : desktopClassName;
    
  return (
    <div className={className}>
      {children}
    </div>
  );
};