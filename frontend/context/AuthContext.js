'use client';

import { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        setUser(data.user);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch user:', err);
        setLoading(false);
      });
  }, []);

  const login = (userData) => {
    setUser(userData);
    setShowAuthModal(false);
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  const requireLogin = () => {
    if (!user) {
      setShowAuthModal(true);
      return false;
    }
    return true;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, requireLogin, showAuthModal, setShowAuthModal }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
