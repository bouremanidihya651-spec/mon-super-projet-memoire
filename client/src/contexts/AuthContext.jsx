import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const AuthContext = createContext();

// Global axios interceptor: if the backend reports the account is blocked
// (e.g. the admin just blocked the user mid-session), log them out and
// redirect to the home page so they can't keep using the dashboard.
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403 && error.response?.data?.code === 'ACCOUNT_BLOCKED') {
      const alreadyOnHome = window.location.pathname === '/' || window.location.pathname === '/login';
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      if (!alreadyOnHome) {
        window.location.href = '/?blocked=1';
      } else {
        window.location.reload();
      }
    }
    return Promise.reject(error);
  }
);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('userData');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // --- GOOGLE AUTH (Login or Register) ---
  const googleAuth = async (userData) => {
    try {
      const response = await fetch(`${API}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Échec de l\'authentification Google');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('userData', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);

      return { success: true, user: data.user, isNewUser: data.isNewUser };
    } catch (error) {
      console.error('Google auth error:', error);
      return { success: false, message: error.message };
    }
  };

  // --- LOGIN ---
  const login = async (email, password) => {
    try {
      const response = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        const err = new Error(data.message || 'Échec de la connexion');
        err.code = data.code || null;
        err.status = response.status;
        throw err;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('userData', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: error.message, code: error.code || null };
    }
  };

  // --- SIGNUP (AVEC PRÉFÉRENCES) ---
  const signup = async (email, password, additionalData = {}) => {
    try {
      const response = await fetch(`${API}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: additionalData.username || email,
          email,
          password,
          firstName: additionalData.firstName,
          lastName: additionalData.lastName,
          age: additionalData.age,
          gender: additionalData.gender,
          travelerType: additionalData.travelerType,
          minBudget: additionalData.minBudget,
          maxBudget: additionalData.maxBudget,
          luxury_score: additionalData.luxury_score,
          nature_score: additionalData.nature_score,
          adventure_score: additionalData.adventure_score,
          culture_score: additionalData.culture_score,
          beach_score: additionalData.beach_score,
          food_score: additionalData.food_score,
          preferredTags: additionalData.preferredTags || []
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Échec de l'inscription");
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('userData', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);

      return { success: true, user: data.user };
    } catch (error) {
      console.error('Signup error:', error);
      return {
        success: false,
        message: error.message === 'Failed to fetch'
          ? "Impossible de contacter le serveur (Port 3000)"
          : error.message
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    setToken('');
    setUser(null);
  };

  const updateAuth = (userData, newToken) => {
    if (newToken) {
      localStorage.setItem('token', newToken);
      setToken(newToken);
    }
    if (userData) {
      localStorage.setItem('userData', JSON.stringify(userData));
      setUser(userData);
    }
  };

  const isAdmin = () => {
    return user && (user.role === 'admin' || user.role === 'administrator');
  };

  const value = {
    user,
    token,
    login,
    signup,
    googleAuth,
    logout,
    updateAuth,
    isAuthenticated: !!user,
    isAdmin,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};