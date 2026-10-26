import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import './App.css';

const Nav = ({ user: propUser, onLogout }) => {
  const location = useLocation();
  const authContext = useAuth ? useAuth() : null;
  const user = propUser || authContext?.user;
  const activeUser = user;
  const isAuthenticated = Boolean(user);
  const [dbStatus, setDbStatus] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/status')
      .then(res => res.json())
      .then(data => setDbStatus(data))
      .catch(() => setDbStatus(null));
  }, []);

  const handleSignOut = () => {
    if (onLogout) {
      onLogout();
    } else if (authContext?.logout) {
      authContext.logout();
    }
  };

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
            Campus Events &amp; Hackathon Portal
          </small>
        </div>
        {/* DB Status Badge */}
        <span
          title={dbStatus?.mongoConnected ? `DB: sitSecB @ 127.0.0.1:27017` : 'DB: Local JSON fallback'}
          style={{
            fontSize: '0.68rem',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '999px',
            border: `1px solid ${dbStatus?.mongoConnected ? 'rgba(16,185,129,0.5)' : 'rgba(245,158,11,0.5)'}`,
            background: dbStatus?.mongoConnected ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
            color: dbStatus?.mongoConnected ? '#10b981' : '#f59e0b',
            whiteSpace: 'nowrap',
            marginLeft: '8px',
            display: dbStatus === null ? 'none' : 'inline-block'
          }}
        >
          <i className={`fa-solid ${dbStatus?.mongoConnected ? 'fa-circle-check' : 'fa-triangle-exclamation'} me-1`}></i>
          {dbStatus?.mongoConnected ? 'DB: MongoDB Connected' : 'DB: Local Fallback'}
        </span>
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

      {/* Auth & Action CTA */}
      <div className="d-flex align-items-center gap-2">
        {activeUser ? (
          <div className="d-flex align-items-center gap-2">
            <Link
              to="/services"
              className="user-nav-badge"
              title="Click to view your registered passes"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '999px',
                padding: '4px 12px 4px 5px',
                textDecoration: 'none'
              }}
            >
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1, #10b981)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.82rem'
                }}
              >
                {activeUser?.name ? activeUser.name.charAt(0).toUpperCase() : 'S'}
              </div>
              <div className="d-none d-md-block text-start">
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc', lineHeight: 1.1 }}>
                  {activeUser?.name?.split(' ')[0] || 'Student'}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#818cf8', fontWeight: 600 }}>
                  {activeUser?.rollNumber || '25070521063'}
                </div>
              </div>
            </Link>

            <button
              onClick={handleSignOut}
              className="btn-nexus-glass"
              style={{
                padding: '7px 12px',
                fontSize: '0.8rem',
                color: '#f87171',
                borderColor: 'rgba(239, 68, 68, 0.3)'
              }}
              title="Sign Out"
            >
              <i className="fa-solid fa-arrow-right-from-bracket"></i>
              <span className="d-none d-sm-inline ms-1">Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="d-flex align-items-center gap-2">
            <Link
              to="/login"
              className={`btn-nexus-glass ${isActive('/login')}`}
              style={{ padding: '7px 14px', fontSize: '0.84rem' }}
            >
              <i className="fa-solid fa-arrow-right-to-bracket me-1"></i> Sign In
            </Link>
            <Link
              to="/signup"
              className="btn-nexus-primary"
              style={{
                padding: '7px 16px',
                fontSize: '0.84rem',
                background: 'linear-gradient(135deg, #6366f1, #ec4899)'
              }}
            >
              <i className="fa-solid fa-user-plus me-1"></i> Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Nav;
