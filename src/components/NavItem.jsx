import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const NavItem = ({ 
  path, 
  label, 
  subLabel,
  isActive = false,
  onClick = null,
  external = false,
  target = "_blank",
  rel = "noopener noreferrer",
  dropdownItems = []
}) => {
  const baseClasses = "transition-colors";
  const activeClasses = isActive 
    ? "text-red-700 font-semibold" 
    : "text-gray-700 hover:text-red-700";

  // If this is an external link, render an anchor tag
  if (external) {
    return (
      <a
        href={path}
        target={target}
        rel={rel}
        onClick={onClick}
        className={`${baseClasses} ${activeClasses}`}
        aria-label={subLabel || label}
      >
        {label}
      </a>
    );
  }

  // If this has dropdown items, render a dropdown menu
  if (dropdownItems && dropdownItems.length > 0) {
    return (
      <div className="relative group">
        <button
          className={`${baseClasses} ${activeClasses} flex items-center`}
          aria-haspopup="true"
          aria-expanded="false"
          onClick={onClick}
        >
          {label}
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 ml-1" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {/* Dropdown menu */}
        <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
          <div className="py-1">
            {dropdownItems.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Otherwise, render a standard link
  return (
    <Link
      to={path}
      onClick={onClick}
      className={`${baseClasses} ${activeClasses}`}
      aria-label={subLabel || label}
    >
      {label}
    </Link>
  );
};

NavItem.propTypes = {
  path: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  subLabel: PropTypes.string,
  isActive: PropTypes.bool,
  onClick: PropTypes.func,
  external: PropTypes.bool,
  target: PropTypes.string,
  rel: PropTypes.string,
  dropdownItems: PropTypes.arrayOf(
    PropTypes.shape({
      path: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired
    })
  )
};

export default NavItem;