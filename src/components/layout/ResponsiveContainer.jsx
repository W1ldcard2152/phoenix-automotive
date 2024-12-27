// src/components/layout/ResponsiveContainer.jsx
import React from 'react';
import { useBreakpoint } from '@/hooks/useBreakpoint';

export const ResponsiveContainer = ({ 
  children,
  mobileClassName = "px-4 py-4",
  desktopClassName = "container mx-auto px-4 py-8",
}) => {
  const { isMobile } = useBreakpoint();
  
  return (
    <div className={isMobile ? mobileClassName : desktopClassName}>
      {children}
    </div>
  );
};