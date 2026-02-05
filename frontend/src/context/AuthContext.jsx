// src/context/AuthContext.jsx
import { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/api';
import { initializeSocket, disconnectSocket } from '../services/socket';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await authAPI.getMe();
      setUser(response.data.data.user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Initialize Socket.IO when user is authenticated
  useEffect(() => {
    if (user) {
      // Get token from cookies or localStorage if needed
      const token = 'authenticated'; // You can enhance this with actual JWT token
      initializeSocket(user.id, token);
    } else {
      disconnectSocket();
    }

    return () => {
      if (!user) {
        disconnectSocket();
      }
    };
  }, [user]);

  const register = async (userData) => {
    try {
      setError(null);
      const response = await authAPI.register(userData);

      // Check if verification is required
      if (response.data.data.requiresVerification) {
        return {
          success: true,
          requiresVerification: true,
          email: response.data.data.email
        };
      }

      setUser(response.data.data.user);
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Registration failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const login = async (credentials) => {
    try {
      setError(null);
      const response = await authAPI.login(credentials);
      setUser(response.data.data.user);
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Login failed';
      const requiresVerification = error.response?.data?.requiresVerification || false;
      setError(errorMsg);
      return {
        success: false,
        error: errorMsg,
        requiresVerification
      };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      setUser(null);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false };
    }
  };

  const value = {
    user,
    setUser,
    loading,
    error,
    register,
    login,
    logout,
    checkAuth,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};