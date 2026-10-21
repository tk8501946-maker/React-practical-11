import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Brand Logo / Title */}
        <Link to="/" className="nav-brand">
          <span className="logo-icon">🌐</span>
          <span className="brand-text">ReactRouter<span className="brand-highlight">Demo</span></span>
        </Link>

        {/* Navigation Links using <Link to="..."> */}
        <ul className="nav-links">
          <li>
            <Link
              to="/"
              className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/about"
              className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}
            >
              About
            </Link>
          </li>
          <li>
            <Link
              to="/contact"
              className={`nav-link ${location.pathname === '/contact' ? 'active' : ''}`}
            >
              Contact
            </Link>
          </li>
        </ul>

        {/* Current Route Indicator Badge */}
        <div className="nav-badge">
          Current Route: <code>{location.pathname}</code>
        </div>
      </div>
    </nav>
  );
}

