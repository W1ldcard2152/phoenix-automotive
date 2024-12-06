import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, MessageSquare } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/parts', label: 'Shop Parts' },
    { path: '/partsrequest', label: 'Request Parts' },
    { path: '/inventory', label: 'Pre-Owned Vehicles' },
    { path: '/contact', label: 'Contact' }
  ];

  const renderNavItem = (item) => (
    <div className="flex items-center h-full">
      <Link
        to={item.path}
        className={`text-lg hover:text-red-700 transition-colors ${
          location.pathname === item.path ? 'text-red-700 font-semibold' : 'text-gray-700'
        }`}
      >
        {item.label}
      </Link>
    </div>
  );

  const renderMobileNavItem = (item) => (
    <Link
      to={item.path}
      className={`block px-3 py-2 text-base font-medium ${
        location.pathname === item.path
          ? 'bg-red-700 text-white'
          : 'text-gray-700 hover:bg-red-50 hover:text-red-700'
      }`}
      onClick={() => setIsOpen(false)}
    >
      {item.label}
    </Link>
  );

  return (
    <>
      <div className="h-[108px]" />
      
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
        <div className="bg-gray-100">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center h-8">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Phone size={16} className="text-red-700 mr-2" />
                  <span>(315) 830-0008</span>
                </div>
                <div className="flex items-center">
                  <MessageSquare size={16} className="text-red-700 mr-2" />
                  <span>(315) 404-0570</span>
                </div>
              </div>
              <div className="hidden md:block text-sm">
                <span>Mon-Fri: 8am-5pm | Sat-Sun: Text Only</span>
              </div>
            </div>
          </div>
        </div>

        <nav className="container mx-auto px-4">
          <div className="flex justify-between items-stretch h-[100px]">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="block">
                <img 
                  src="/images/phoenix-automotive-logo.svg" 
                  alt="Phoenix Automotive Group, Inc." 
                  className="h-[100px] object-contain object-left"
                  style={{
                    aspectRatio: "1000/160",
                    width: "625px"
                  }}
                />
              </Link>
            </div>

            <div className="hidden md:flex items-stretch space-x-8 h-full">
              {navItems.map((item) => (
                <div key={item.path} className="flex items-center">
                  {renderNavItem(item)}
                </div>
              ))}
            </div>

            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-700 hover:text-red-700 p-2"
                aria-label="Toggle menu"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {isOpen && (
            <div className="md:hidden absolute left-0 right-0 bg-white border-b border-gray-200">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navItems.map((item) => (
                  <div key={item.path}>
                    {renderMobileNavItem(item)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </nav>
      </header>
    </>
  );
};

export default Navbar;