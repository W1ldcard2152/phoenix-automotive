import React from 'react';
import PropTypes from 'prop-types';
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const MobileDrawer = ({ 
  children,
  trigger,
  className = "",
  isOpen,
  onClose
}) => {
  console.log('MobileDrawer render - isOpen:', isOpen);
  
  return (
    <div>
      {trigger || (
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => onClose(!isOpen)}
        >
          <Menu className="h-6 w-6" />
        </Button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => onClose(false)}
          />
          
          {/* Drawer Content */}
          <div className={`absolute right-0 top-0 h-full w-80 bg-white p-6 shadow-lg ${className}`}>
            <Button 
              variant="ghost" 
              size="icon"
              className="absolute right-4 top-4"
              onClick={() => onClose(false)}
            >
              <X className="h-6 w-6" />
            </Button>
            <div className="mt-12">
              {children}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

MobileDrawer.propTypes = {
  children: PropTypes.node.isRequired,
  trigger: PropTypes.node,
  className: PropTypes.string,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default MobileDrawer;