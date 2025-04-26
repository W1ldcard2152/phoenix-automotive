import { useState, useCallback, Suspense } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Phone, MessageSquare, Menu, Home, Settings, FileSearch, Car, HelpCircle } from 'lucide-react';
import { Wrench as ToolIcon } from 'lucide-react';
import { MobileDrawer } from '@/components/layout';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { Button } from "@/components/ui/button";
import NavItem from './NavItem';

const Navbar = () => {
  const location = useLocation();
  const { isMobile, width } = useBreakpoint();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Memoized navigation handler
  const handleNavigation = useCallback(() => {
    try {
      setIsDrawerOpen(false);
    } catch (error) {
      console.error('Error closing drawer:', error);
    }
  }, []);

  // Memoized drawer state handler
  const handleDrawerState = useCallback((state) => {
    try {
      console.log('Setting drawer state:', state);
      setIsDrawerOpen(state);
    } catch (error) {
      console.error('Error setting drawer state:', error);
      // Attempt to force drawer closed on error
      setIsDrawerOpen(false);
    }
  }, []);

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/parts', label: 'Shop Parts', icon: ToolIcon },
    { path: '/partsrequest', label: 'Request Parts', icon: FileSearch },
    { path: '/repair', label: 'Repair Services', icon: Settings },
    { path: '/inventory', label: 'Pre-Owned Vehicles', icon: Car },
    { path: '/contact', label: 'Contact', icon: HelpCircle }
  ];

  const renderNavItem = useCallback((item) => (
    <NavItem
      key={item.path}
      path={item.path}
      label={item.label}
      isActive={location.pathname === item.path}
    />
  ), [location.pathname]);

  const renderMobileNavItem = useCallback((item) => {
    // Safely handle the icon - if unavailable, don't render it
    let Icon = null;
    try {
      Icon = item.icon;
    } catch (e) {
      console.error(`Error loading icon for ${item.label}:`, e);
    }
    return (
      <Link
        key={item.path}
        to={item.path}
        onClick={handleNavigation}
        className={`block py-3 px-4 text-lg flex items-center ${
          location.pathname === item.path
            ? 'bg-red-50 text-red-700 font-semibold'
            : 'text-gray-700 hover:bg-gray-50'
        }`}
      >
        {Icon ? <Icon className="mr-3 h-5 w-5" /> : null}
        {item.label}
      </Link>
    );
  }, [location.pathname, handleNavigation]);

  const ContactInfo = useCallback(() => (
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
  ), []);

  // Early return if width is undefined (prevents flash of content)
  if (typeof width === 'undefined') {
    return null;
  }

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
                {navItems.map(renderNavItem)}
              </div>
            )}

            {/* Mobile Navigation */}
            {isMobile && (
              <div className="flex items-center space-x-4">
                <a href="tel:3158300008" className="p-2">
                  <Phone className="h-6 w-6 text-red-700" />
                </a>
                <Suspense fallback={
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                }>
                  <MobileDrawer
                    isOpen={isDrawerOpen}
                    onClose={handleDrawerState}
                    trigger={
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDrawerState(true)}
                        aria-label="Open menu"
                      >
                        <Menu className="h-6 w-6" />
                      </Button>
                    }
                  >
                    <nav className="flex flex-col py-4" role="navigation">
                      {navItems.map(renderMobileNavItem)}
                      <div className="mt-6 px-4 pt-6 border-t">
                        <div className="text-sm text-gray-600 space-y-4">
                          <a 
                            href="tel:3158300008" 
                            className="flex items-center space-x-3"
                            aria-label="Call us"
                          >
                            <Phone size={16} className="text-red-700" />
                            <span>(315) 830-0008</span>
                          </a>
                          <a 
                            href="sms:3154040570" 
                            className="flex items-center space-x-3"
                            aria-label="Text us"
                          >
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
                    </nav>
                  </MobileDrawer>
                </Suspense>
              </div>
            )}
          </div>
        </nav>
      </header>
    </>
  );
};

export default Navbar;