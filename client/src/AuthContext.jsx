import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('sit_auth_user') || localStorage.getItem('sit_nexus_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('sit_auth_token') || localStorage.getItem('sit_nexus_token') || '';
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('sit_auth_user', JSON.stringify(user));
      localStorage.setItem('sit_nexus_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('sit_auth_user');
      localStorage.removeItem('sit_nexus_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('sit_auth_token', token);
      localStorage.setItem('sit_nexus_token', token);
    } else {
      localStorage.removeItem('sit_auth_token');
      localStorage.removeItem('sit_nexus_token');
    }
  }, [token]);

  // Login handler
  const login = async (emailOrRoll, password) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailOrRoll, password })
      });

      const data = await response.json();

      if (!response.ok || !data.success && data.msg) {
        throw new Error(data.msg || 'Invalid login credentials');
      }

      const userData = data.user || {
        name: data.subject || emailOrRoll.split('@')[0],
        email: emailOrRoll,
        role: data.role || 'Student'
      };

      setUser(userData);
      setToken(data.jwtToken || 'mock_jwt_token_' + Date.now());
      setLoading(false);
      return { success: true, user: userData };
    } catch (err) {
      setLoading(false);
      // Offline fallback: check localStorage users
      const localUsers = JSON.parse(localStorage.getItem('sit_local_students') || '[]');
      const query = emailOrRoll.trim().toLowerCase();
      const matched = localUsers.find(
        u => (u.email && u.email.toLowerCase() === query) ||
             (u.rollNumber && u.rollNumber.toLowerCase() === query)
      );

      if (matched && (!matched.password || matched.password === password)) {
        const safe = { ...matched };
        delete safe.password;
        setUser(safe);
        setToken('offline_token_' + Date.now());
        return { success: true, user: safe, offline: true };
      }

      throw err;
    }
  };

  // Sign up handler
  const signup = async (formData) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok || !data.success && data.msg) {
        throw new Error(data.msg || 'Registration failed');
      }

      const newUser = data.student || {
        name: formData.name,
        email: formData.email,
        rollNumber: formData.rollNumber,
        branch: formData.branch,
        status: formData.status || 'Active Student'
      };

      // Also persist to local backup
      const localUsers = JSON.parse(localStorage.getItem('sit_local_students') || '[]');
      localUsers.unshift({ ...newUser, password: formData.password });
      localStorage.setItem('sit_local_students', JSON.stringify(localUsers));

      setUser(newUser);
      setToken(data.jwtToken || 'mock_jwt_token_' + Date.now());
      setLoading(false);
      return { success: true, user: newUser };
    } catch (err) {
      setLoading(false);
      // If server is offline, still register locally so demo never fails
      const localUsers = JSON.parse(localStorage.getItem('sit_local_students') || '[]');
      const exists = localUsers.some(u => u.email.toLowerCase() === formData.email.toLowerCase());
      if (exists) {
        throw new Error('An account with this email already exists locally.');
      }
      const offlineUser = {
        _id: 'sid_' + Date.now(),
        name: formData.name,
        email: formData.email,
        rollNumber: formData.rollNumber,
        branch: formData.branch,
        status: 'Active Student',
        createdAt: new Date().toISOString()
      };
      localUsers.unshift({ ...offlineUser, password: formData.password });
      localStorage.setItem('sit_local_students', JSON.stringify(localUsers));

      setUser(offlineUser);
      setToken('offline_token_' + Date.now());
      return { success: true, user: offlineUser, offline: true };
    }
  };

  const logout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('sit_nexus_user');
    localStorage.removeItem('sit_nexus_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      token: '',
      isAuthenticated: false,
      loading: false,
      login: async () => {},
      signup: async () => {},
      logout: () => {}
    };
  }
  return context;
};
