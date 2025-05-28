import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white p-4 mt-8">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <p>&copy; {new Date().getFullYear()} Phoenix Automotive. All rights reserved.</p>
        <nav className="mt-2 md:mt-0">
          <Link to="/privacy-policy" className="text-white hover:text-gray-300 mx-2">Privacy Policy</Link>
          {/* Add other footer links here if needed */}
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
