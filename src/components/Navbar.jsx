// src/components/Navbar.jsx
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Phone, MessageSquare, Menu } from 'lucide-react';
import { MobileDrawer } from '@/components/layout';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const location = useLocation();
  const { isMobile } = useBreakpoint();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  console.log('Navbar render - isDrawerOpen:', isDrawerOpen);

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/parts', label: 'Shop Parts' },
    { path: '/partsrequest', label: 'Request Parts' },
    { path: '/inventory', label: 'Pre-Owned Vehicles' },
    { path: '/contact', label: 'Contact' }
  ];

  const handleNavigation = () => {
    setIsDrawerOpen(false);
  };

  const renderNavItem = (item) => (
    <Link
      key={item.path}
      to={item.path}
      className={`text-lg hover:text-red-700 transition-colors ${
        location.pathname === item.path ? 'text-red-700 font-semibold' : 'text-gray-700'
      }`}
    >
      {item.label}
    </Link>
  );

  const renderMobileNavItem = (item) => (
    <Link
      key={item.path}
      to={item.path}
      onClick={handleNavigation}
      className={`block py-3 px-4 text-lg ${
        location.pathname === item.path
          ? 'bg-red-50 text-red-700 font-semibold'
          : 'text-gray-700 hover:bg-gray-50'
      }`}
    >
      {item.label}
    </Link>
  );

  const ContactInfo = () => (
    <div className="flex items-center space-x-4 text-sm">
      <a href="tel:3158300008" className="flex items-center">
        <Phone size={16} className="text-red-700 mr-2" />
        <span>(315) 830-0008</span>
      </a>
      <a href="sms:3154040570" className="flex items-center">
        <MessageSquare size={16} className="text-red-700 mr-2" />
        <span>(315) 404-0570</span>
      </a>
    </div>
  );

  return (
    <>
      <div className="h-[72px] md:h-[108px]" />
      
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
        {/* Top Bar - Hidden on Mobile */}
        {!isMobile && (
          <div className="bg-gray-100">
            <div className="container mx-auto px-4">
              <div className="flex justify-between items-center h-8">
                <ContactInfo />
                <div className="text-sm">
                  Mon-Fri: 8am-5pm | Sat-Sun: Text Only
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Navbar */}
        <nav className="container mx-auto px-4">
          <div className={`flex justify-between items-center ${isMobile ? 'h-[72px]' : 'h-[100px]'}`}>
            {/* Logo */}
            <Link to="/" className="block">
              <img 
                src="/images/phoenix-automotive-logo.svg" 
                alt="Phoenix Automotive Group, Inc." 
                className={isMobile ? 'h-12' : 'h-[100px]'}
                style={{
                  aspectRatio: "1000/160",
                  width: isMobile ? "auto" : "625px"
                }}
              />
            </Link>

            {/* Desktop Navigation */}
            {!isMobile && (
              <div className="flex items-center space-x-8">
                {navItems.map(item => renderNavItem(item))}
              </div>
            )}

            {/* Mobile Navigation */}
            {isMobile && (
              <div className="flex items-center space-x-4">
                <a href="tel:3158300008" className="p-2">
                  <Phone className="h-6 w-6 text-red-700" />
                </a>
                <MobileDrawer
                  isOpen={isDrawerOpen}
                  onClose={setIsDrawerOpen}
                  trigger={
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => {
                        console.log('Menu button clicked');
                        setIsDrawerOpen(true);
                      }}
                    >
                      <Menu className="h-6 w-6" />
                    </Button>
                  }
                >
                  <div className="flex flex-col py-4">
                    {navItems.map(item => renderMobileNavItem(item))}
                    <div className="mt-6 px-4 pt-6 border-t">
                      <div className="text-sm text-gray-600 space-y-4">
                        <a href="tel:3158300008" className="flex items-center space-x-3">
                          <Phone size={16} className="text-red-700" />
                          <span>(315) 830-0008</span>
                        </a>
                        <a href="sms:3154040570" className="flex items-center space-x-3">
                          <MessageSquare size={16} className="text-red-700" />
                          <span>(315) 404-0570</span>
                        </a>
                        <div className="pt-4">
                          <div className="font-medium">Hours:</div>
                          <div>Mon-Fri: 8am-5pm</div>
                          <div>Sat-Sun: Text Only</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </MobileDrawer>
              </div>
            )}
          </div>
        </nav>
      </header>
    </>
  );
};

export default Navbar;