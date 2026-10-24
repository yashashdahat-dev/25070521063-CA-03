import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './App.css';

const Nav = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="nexus-navbar d-flex align-items-center justify-content-between">
      {/* Brand Logo */}
      <Link to="/" className="brand-wrapper">
        <div className="brand-icon">
          <i className="fa-solid fa-code-branch"></i>
        </div>
        <div>
          <div className="brand-text">
            SIT <span style={{ color: '#818cf8' }}>NEXUS</span>
            <span className="brand-badge">CA-03</span>
          </div>
          <small style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block' }}>
            Campus Events & Hackathon Portal
          </small>
        </div>
      </Link>

      {/* Nav Links */}
      <ul className="nav-links-list">
        <li>
          <Link to="/" className={`nav-link-custom ${isActive('/')}`}>
            <i className="fa-solid fa-house"></i> Home
          </Link>
        </li>
        <li>
          <Link to="/services" className={`nav-link-custom ${isActive('/services')}`}>
            <i className="fa-solid fa-trophy"></i> Events & Hackathons
          </Link>
        </li>
        <li>
          <Link to="/about" className={`nav-link-custom ${isActive('/about')}`}>
            <i className="fa-solid fa-building-columns"></i> About SIT
          </Link>
        </li>
        <li>
          <Link to="/contact" className={`nav-link-custom ${isActive('/contact')}`}>
            <i className="fa-solid fa-headset"></i> Support
          </Link>
        </li>
      </ul>

      {/* Action CTA */}
      <div className="d-flex align-items-center gap-2">
        <Link to="/services" className="btn-nexus-primary" style={{ padding: '8px 18px', fontSize: '0.88rem' }}>
          <i className="fa-solid fa-bolt"></i> Register for Hackathon
        </Link>
      </div>
    </nav>
  );
};

export default Nav;
