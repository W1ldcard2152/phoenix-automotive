import React, { useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export const MobileDrawer = ({ 
  children,
  trigger,
  className = "",
  isOpen,
  onClose
}) => {
  // Handle escape key press
  const handleEscapeKey = useCallback((e) => {
    if (e.key === 'Escape' && isOpen) {
      onClose(false);
    }
  }, [isOpen, onClose]);

  // Handle scroll lock and escape key
  useEffect(() => {
    if (!window) return;

    // Save initial body style
    const originalStyle = window.getComputedStyle(document.body).overflow;

    if (isOpen) {
      // Lock scroll
      document.body.style.overflow = 'hidden';
      // Add escape key listener
      window.addEventListener('keydown', handleEscapeKey);
    }

    // Cleanup function
    return () => {
      // Restore original scroll behavior
      document.body.style.overflow = originalStyle;
      // Remove escape key listener
      window.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, handleEscapeKey]);

  // Handle clicks outside drawer
  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      onClose(false);
    }
  }, [onClose]);

  // Default trigger button if none provided
  const defaultTrigger = (
    <Button 
      variant="ghost" 
      size="icon"
      onClick={() => onClose(!isOpen)}
      aria-label={isOpen ? "Close menu" : "Open menu"}
    >
      <Menu className="h-6 w-6" />
    </Button>
  );

  return (
    <div className="relative">
      {/* Render either custom trigger or default */}
      {trigger || defaultTrigger}

      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex justify-end"
          role="dialog"
          aria-modal="true"
          onClick={handleBackdropClick}
        >
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 transition-opacity"
            aria-hidden="true"
          />
          
          {/* Drawer panel */}
          <div 
            className={`relative w-80 max-w-[90vw] bg-white shadow-xl transition-transform duration-300 ease-in-out ${className}`}
            style={{
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {/* Close button */}
            <Button 
              variant="ghost" 
              size="icon"
              className="absolute right-4 top-4 z-10"
              onClick={() => onClose(false)}
              aria-label="Close menu"
            >
              <X className="h-6 w-6" />
            </Button>

            {/* Content container */}
            <div 
              className="h-full overflow-y-auto overscroll-contain p-6 pb-safe-area-inset-bottom"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#CBD5E0 #F7FAFC'
              }}
            >
              <div className="mt-12">
                {children}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Add prop-types validation
MobileDrawer.propTypes = {
  children: PropTypes.node.isRequired,
  trigger: PropTypes.element,
  className: PropTypes.string,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default MobileDrawer;