import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Footer from './homeComp/footer';
import { API_BASE } from './apiConfig';
import './App.css';

const Auth = ({ initialTab = 'login', onAuthSuccess }) => {
  const { user, isAuthenticated, logout } = useAuth ? useAuth() : { user: null, isAuthenticated: false, logout: () => {} };
  const navigate = useNavigate();
  const location = useLocation();

  // Determine initial tab from query param or prop
  const searchParams = new URLSearchParams(location.search);
  const requestedTab = searchParams.get('tab') || initialTab;
  const [activeTab, setActiveTab] = useState(requestedTab); // 'login' or 'signup'

  // Login Form State
  const [loginForm, setLoginForm] = useState({
    emailOrRoll: '',
    password: '',
    remember: true
  });
  const [showLoginPass, setShowLoginPass] = useState(false);

  // Sign Up Form State
  const [signupForm, setSignupForm] = useState({
    name: '',
    rollNumber: '',
    email: '',
    branch: 'Computer Science & Engineering',
    year: '2nd Year',
    age: '20',
    password: '',
    confirmPassword: '',
    status: 'CA-03 Student Innovator'
  });
  const [showSignupPass, setShowSignupPass] = useState(false);

  // Feedback State
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Quick 1-Click Demo Fill
  const handleQuickDemo = () => {
    setErrorMsg('');
    setLoginForm({
      emailOrRoll: '25070521063',
      password: 'password123',
      remember: true
    });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!loginForm.emailOrRoll.trim() || !loginForm.password) {
      setErrorMsg('Please enter both Email/Roll Number and Password.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginForm.emailOrRoll.trim(), password: loginForm.password })
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Login failed. Please check your credentials.');
      }
      setSuccessMsg(`Welcome back, ${data.user?.name || 'Student'}! Signing you in...`);
      if (onAuthSuccess) {
        onAuthSuccess(data.user, data.jwtToken);
      } else {
        setTimeout(() => {
          navigate('/');
        }, 1000);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!signupForm.name.trim() || !signupForm.email.trim() || !signupForm.rollNumber.trim()) {
      setErrorMsg('Full Name, Email, and Student PRN / Roll Number are required.');
      return;
    }

    if (!signupForm.password || signupForm.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (signupForm.password !== signupForm.confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signupForm.name.trim(),
          rollNumber: signupForm.rollNumber.trim(),
          email: signupForm.email.trim(),
          branch: signupForm.branch,
          age: Number(signupForm.age) || 20,
          password: signupForm.password
        })
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Registration failed. Try again.');
      }

      setSuccessMsg(`Registration successful! Welcome to SIT Nexus, ${data.user?.name || 'Student'}. Signing you in...`);
      if (onAuthSuccess) {
        onAuthSuccess(data.user, data.jwtToken);
      } else {
        setTimeout(() => {
          navigate('/');
        }, 1000);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // If already logged in
  if (isAuthenticated && !successMsg) {
    return (
      <div style={{ minHeight: '85vh', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div className="container py-5" style={{ maxWidth: '640px', marginTop: '2rem' }}>
          <div className="glass-card text-center" style={{ padding: '2.5rem 2rem' }}>
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1, #10b981)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                color: '#fff',
                marginBottom: '1.25rem',
                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)'
              }}
            >
              <i className="fa-solid fa-user-check"></i>
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Already Signed In
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '1rem', marginBottom: '1.5rem' }}>
              You are currently authenticated as <strong style={{ color: '#f8fafc' }}>{user?.name}</strong>.
            </p>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '1.2rem',
                textAlign: 'left',
                marginBottom: '1.75rem'
              }}
            >
              <div className="d-flex justify-content-between mb-2">
                <span style={{ color: '#94a3b8', fontSize: '0.88rem' }}>Roll Number / PRN:</span>
                <span style={{ fontWeight: 600, color: '#818cf8' }}>{user?.rollNumber || '25070521063'}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span style={{ color: '#94a3b8', fontSize: '0.88rem' }}>Email:</span>
                <span style={{ fontWeight: 600 }}>{user?.email}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span style={{ color: '#94a3b8', fontSize: '0.88rem' }}>Department:</span>
                <span style={{ fontWeight: 600 }}>{user?.branch || 'Computer Science'}</span>
              </div>
            </div>

            <div className="d-flex gap-3 justify-content-center flex-wrap">
              <Link to="/services" className="btn-nexus-primary" style={{ padding: '10px 22px' }}>
                <i className="fa-solid fa-ticket"></i> View My Event Passes
              </Link>
              <button
                onClick={logout}
                className="btn-nexus-glass"
                style={{ padding: '10px 22px', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}
              >
                <i className="fa-solid fa-arrow-right-from-bracket"></i> Sign Out
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div className="container py-5" style={{ maxWidth: '580px', marginTop: '1rem' }}>
        
        {/* Header Breadcrumb Pill */}
        <div className="text-center mb-4">
          <div className="hero-pill d-inline-block">
            <i className="fa-solid fa-shield-halved"></i> SIT NEXUS Student Authentication
          </div>
          <h1 style={{ fontSize: '2.1rem', fontWeight: 800, marginTop: '0.5rem', marginBottom: '0.4rem' }}>
            {activeTab === 'login' ? 'Sign In to Your Account' : 'Create Student Profile'}
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
            {activeTab === 'login'
              ? 'Access hackathon registrations, digital QR passes, and team dashboards.'
              : 'Join SIT Nexus to register for hackathons and access tech symposiums.'}
          </p>
        </div>

        {/* Auth Tab Switcher */}
        <div
          style={{
            display: 'flex',
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '14px',
            padding: '5px',
            marginBottom: '1.5rem',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
          }}
        >
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            style={{
              flex: 1,
              padding: '10px',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.92rem',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              background: activeTab === 'login' ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'transparent',
              color: activeTab === 'login' ? '#ffffff' : '#94a3b8',
              boxShadow: activeTab === 'login' ? '0 4px 15px rgba(99, 102, 241, 0.35)' : 'none'
            }}
          >
            <i className="fa-solid fa-arrow-right-to-bracket me-2"></i> Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('signup');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            style={{
              flex: 1,
              padding: '10px',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.92rem',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              background: activeTab === 'signup' ? 'linear-gradient(135deg, #6366f1, #ec4899)' : 'transparent',
              color: activeTab === 'signup' ? '#ffffff' : '#94a3b8',
              boxShadow: activeTab === 'signup' ? '0 4px 15px rgba(236, 72, 153, 0.35)' : 'none'
            }}
          >
            <i className="fa-solid fa-user-plus me-2"></i> Register / Sign Up
          </button>
        </div>

        {/* Feedback Alerts */}
        {errorMsg && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#fca5a5',
              padding: '12px 16px',
              borderRadius: '10px',
              marginBottom: '1.25rem',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              animation: 'fadeIn 0.3s ease'
            }}
          >
            <i className="fa-solid fa-circle-exclamation text-danger"></i>
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#6ee7b7',
              padding: '12px 16px',
              borderRadius: '10px',
              marginBottom: '1.25rem',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              animation: 'fadeIn 0.3s ease'
            }}
          >
            <i className="fa-solid fa-circle-check text-success"></i>
            <span>{successMsg}</span>
          </div>
        )}

        {/* Main Auth Card */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          
          {/* ======================= SIGN IN FORM ======================= */}
          {activeTab === 'login' ? (
            <form onSubmit={handleLoginSubmit}>
              <div className="mb-3">
                <label className="form-label" style={{ fontSize: '0.88rem', fontWeight: 600, color: '#cbd5e1' }}>
                  <i className="fa-solid fa-envelope me-1 text-primary"></i> Email or Roll Number / PRN
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-control nexus-input"
                    placeholder="e.g. 25070521063 or student@sit.edu"
                    value={loginForm.emailOrRoll}
                    onChange={(e) => setLoginForm({ ...loginForm, emailOrRoll: e.target.value })}
                    required
                  />
                </div>
                <small style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  You can enter either your college roll number or registered email.
                </small>
              </div>

              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label mb-0" style={{ fontSize: '0.88rem', fontWeight: 600, color: '#cbd5e1' }}>
                    <i className="fa-solid fa-lock me-1 text-primary"></i> Password
                  </label>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showLoginPass ? 'text' : 'password'}
                    className="form-control nexus-input"
                    placeholder="••••••••"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPass(!showLoginPass)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer'
                    }}
                  >
                    <i className={showLoginPass ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'}></i>
                  </button>
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center mb-4">
                <label style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={loginForm.remember}
                    onChange={(e) => setLoginForm({ ...loginForm, remember: e.target.checked })}
                    style={{ accentColor: '#6366f1' }}
                  />
                  Remember session
                </label>
                <button
                  type="button"
                  onClick={handleQuickDemo}
                  style={{
                    background: 'rgba(99, 102, 241, 0.1)',
                    border: '1px dashed rgba(99, 102, 241, 0.4)',
                    color: '#818cf8',
                    padding: '3px 10px',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    cursor: 'pointer'
                  }}
                  title="Click to auto-fill default CA-03 student credentials"
                >
                  <i className="fa-solid fa-wand-magic-sparkles me-1"></i> Quick Demo Fill
                </button>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-nexus-primary w-100"
                style={{ padding: '12px', fontSize: '0.98rem' }}
              >
                {submitting ? (
                  <span><i className="fa-solid fa-circle-notch fa-spin me-2"></i> Authenticating...</span>
                ) : (
                  <span><i className="fa-solid fa-arrow-right-to-bracket me-2"></i> Sign In to Portal</span>
                )}
              </button>

              <div className="text-center mt-4 pt-2" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                  First time visiting SIT Nexus?{' '}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('signup');
                    setErrorMsg('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#818cf8',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Create an account
                </button>
              </div>
            </form>
          ) : (
            /* ======================= SIGN UP FORM ======================= */
            <form onSubmit={handleSignupSubmit}>
              <div className="row g-3 mb-3">
                <div className="col-md-7">
                  <label className="form-label" style={{ fontSize: '0.88rem', fontWeight: 600, color: '#cbd5e1' }}>
                    <i className="fa-solid fa-user me-1 text-primary"></i> Full Name *
                  </label>
                  <input
                    type="text"
                    className="form-control nexus-input"
                    placeholder="e.g. Yashash Dahat"
                    value={signupForm.name}
                    onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-5">
                  <label className="form-label" style={{ fontSize: '0.88rem', fontWeight: 600, color: '#cbd5e1' }}>
                    <i className="fa-solid fa-id-card me-1 text-primary"></i> Roll No / PRN *
                  </label>
                  <input
                    type="text"
                    className="form-control nexus-input"
                    placeholder="e.g. 25070521063"
                    value={signupForm.rollNumber}
                    onChange={(e) => setSignupForm({ ...signupForm, rollNumber: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label" style={{ fontSize: '0.88rem', fontWeight: 600, color: '#cbd5e1' }}>
                  <i className="fa-solid fa-envelope me-1 text-primary"></i> College / Personal Email *
                </label>
                <input
                  type="email"
                  className="form-control nexus-input"
                  placeholder="e.g. yashash@sit.edu"
                  value={signupForm.email}
                  onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                  required
                />
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-7">
                  <label className="form-label" style={{ fontSize: '0.88rem', fontWeight: 600, color: '#cbd5e1' }}>
                    <i className="fa-solid fa-graduation-cap me-1 text-primary"></i> Department / Branch
                  </label>
                  <select
                    className="form-control nexus-input"
                    value={signupForm.branch}
                    onChange={(e) => setSignupForm({ ...signupForm, branch: e.target.value })}
                    style={{ background: '#12182b', color: '#f8fafc' }}
                  >
                    <option value="Computer Science & Engineering">Computer Science & Eng (CSE)</option>
                    <option value="Artificial Intelligence & Data Science">AI & Data Science (AI/DS)</option>
                    <option value="Information Technology">Information Technology (IT)</option>
                    <option value="Electronics & Telecommunication">Electronics & Telecom (ENTC)</option>
                    <option value="Robotics & Automation">Robotics & Automation</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                  </select>
                </div>
                <div className="col-md-5">
                  <label className="form-label" style={{ fontSize: '0.88rem', fontWeight: 600, color: '#cbd5e1' }}>
                    <i className="fa-solid fa-calendar me-1 text-primary"></i> Year of Study
                  </label>
                  <select
                    className="form-control nexus-input"
                    value={signupForm.year}
                    onChange={(e) => setSignupForm({ ...signupForm, year: e.target.value })}
                    style={{ background: '#12182b', color: '#f8fafc' }}
                  >
                    <option value="1st Year">1st Year (FE)</option>
                    <option value="2nd Year">2nd Year (SE)</option>
                    <option value="3rd Year">3rd Year (TE)</option>
                    <option value="4th Year">4th Year (BE)</option>
                  </select>
                </div>
              </div>

              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label" style={{ fontSize: '0.88rem', fontWeight: 600, color: '#cbd5e1' }}>
                    <i className="fa-solid fa-lock me-1 text-primary"></i> Password *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showSignupPass ? 'text' : 'password'}
                      className="form-control nexus-input"
                      placeholder="Min. 6 chars"
                      value={signupForm.password}
                      onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPass(!showSignupPass)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer'
                      }}
                    >
                      <i className={showSignupPass ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'}></i>
                    </button>
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label" style={{ fontSize: '0.88rem', fontWeight: 600, color: '#cbd5e1' }}>
                    <i className="fa-solid fa-circle-check me-1 text-primary"></i> Confirm Password *
                  </label>
                  <input
                    type={showSignupPass ? 'text' : 'password'}
                    className="form-control nexus-input"
                    placeholder="Repeat password"
                    value={signupForm.confirmPassword}
                    onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-nexus-primary w-100"
                style={{
                  padding: '12px',
                  fontSize: '0.98rem',
                  background: 'linear-gradient(135deg, #6366f1, #ec4899)'
                }}
              >
                {submitting ? (
                  <span><i className="fa-solid fa-circle-notch fa-spin me-2"></i> Registering Account...</span>
                ) : (
                  <span><i className="fa-solid fa-user-plus me-2"></i> Create Account & Join Nexus</span>
                )}
              </button>

              <div className="text-center mt-4 pt-2" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                  Already have an account?{' '}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setErrorMsg('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#818cf8',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Sign In instead
                </button>
              </div>
            </form>
          )}

        </div>

      </div>

      <Footer />
    </div>
  );
};

export default Auth;
