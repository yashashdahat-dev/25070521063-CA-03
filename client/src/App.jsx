import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './home';
import About from './about';
import Services from './services';
import Contact from './contact';
import Nav from './nav';
import Auth from './auth';

const App = () => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('sit_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('sit_auth_token') || '';
  });

  const [validating, setValidating] = useState(Boolean(token));

  // Validate token on load via GET http://localhost:5000/api/auth/me
  useEffect(() => {
    if (!token) {
      setValidating(false);
      return;
    }

    fetch('http://localhost:5000/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUser(data.user);
            localStorage.setItem('sit_auth_user', JSON.stringify(data.user));
          }
        } else {
          // Token invalid or expired — clear stored session
          handleLogout();
        }
      })
      .catch(() => {
        // If server is temporarily offline, retain cached user credentials for offline experience
      })
      .finally(() => {
        setValidating(false);
      });
  }, [token]);

  const handleAuthSuccess = (authUser, authToken) => {
    setUser(authUser);
    setToken(authToken);
    if (authUser) {
      localStorage.setItem('sit_auth_user', JSON.stringify(authUser));
    }
    if (authToken) {
      localStorage.setItem('sit_auth_token', authToken);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('sit_auth_user');
    localStorage.removeItem('sit_auth_token');
    localStorage.removeItem('sit_nexus_user');
    localStorage.removeItem('sit_nexus_token');
  };

  if (validating) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#090d16',
        color: '#94a3b8'
      }}>
        <div className="spinner-border text-primary mb-3" role="status" style={{ width: '2.5rem', height: '2.5rem' }}></div>
        <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#e2e8f0' }}>Verifying SIT Nexus credentials...</div>
        <small style={{ color: '#64748b', marginTop: '4px' }}>Connecting to sitSecB security provider</small>
      </div>
    );
  }

  // Strict Authentication Gate: if !user or !token, do not render Nav or internal pages
  if (!user || !token) {
    return (
      <Routes>
        <Route path="*" element={<Auth onAuthSuccess={handleAuthSuccess} />} />
      </Routes>
    );
  }

  // Once authenticated, render Nav and all internal routes with user & token passed
  return (
    <>
      <Nav user={user} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Home user={user} token={token} />} />
        <Route path="/about" element={<About user={user} token={token} />} />
        <Route path="/services" element={<Services user={user} token={token} />} />
        <Route path="/contact" element={<Contact user={user} token={token} />} />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/signup" element={<Navigate to="/" replace />} />
        <Route path="/auth" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Home user={user} token={token} />} />
      </Routes>
    </>
  );
};

export default App;