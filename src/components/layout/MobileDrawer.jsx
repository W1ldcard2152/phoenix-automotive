// src/components/layout/MobileDrawer.jsx
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export const MobileDrawer = ({ 
  children,
  trigger,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      {trigger || (
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setIsOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </Button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Drawer */}
          <div className={`absolute right-0 top-0 h-full w-80 bg-white p-6 shadow-lg ${className}`}>
            <Button 
              variant="ghost" 
              size="icon"
              className="absolute right-4 top-4"
              onClick={() => setIsOpen(false)}
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