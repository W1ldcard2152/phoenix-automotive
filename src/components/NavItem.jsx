import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const NavItem = ({ 
  path, 
  label, 
  isActive = false,
  onClick = null,
  external = false
}) => {
  const baseClasses = "transition-colors";
  const activeClasses = isActive 
    ? "text-red-700 font-semibold" 
    : "text-gray-700 hover:text-red-700";

  if (external) {
    return (
      <a
        href={path}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        className={`${baseClasses} ${activeClasses}`}
      >
        {label}
      </a>
    );
  }

  return (
    <Link
      to={path}
      onClick={onClick}
      className={`${baseClasses} ${activeClasses}`}
    >
      {label}
    </Link>
  );
};

NavItem.propTypes = {
  path: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  isActive: PropTypes.bool,
  onClick: PropTypes.func,
  external: PropTypes.bool
};

export default NavItem;