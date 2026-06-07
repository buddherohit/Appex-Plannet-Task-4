// frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  // Load and verify session on initial load
  useEffect(() => {
    const verifyUser = async () => {
      if (token) {
        try {
          const response = await api.get('/api/auth.php?action=verify');
          if (response.data.success) {
            setUser(response.data.data.user);
          } else {
            handleLogoutState();
          }
        } catch (error) {
          console.error("Session verification failed:", error);
          handleLogoutState();
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, [token]);

  // Apply theme class to document body
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const handleLogoutState = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  // Login action
  const login = async (email, password) => {
    try {
      const response = await api.post('/api/auth.php?action=login', { email, password });
      if (response.data.success) {
        const { token: userToken, user: userData } = response.data.data;
        localStorage.setItem('token', userToken);
        setToken(userToken);
        setUser(userData);
      }
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || "Login failed. Connection error.";
      return { success: false, message: msg };
    }
  };

  // Register action
  const register = async (fullName, email, mobile, password) => {
    try {
      const response = await api.post('/api/auth.php?action=register', {
        full_name: fullName,
        email,
        mobile,
        password
      });
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || "Registration failed. Connection error.";
      return { success: false, message: msg };
    }
  };

  // Logout action
  const logout = async () => {
    try {
      await api.get('/api/auth.php?action=logout');
    } catch (error) {
      console.error("Logout API request error:", error);
    } finally {
      handleLogoutState();
    }
  };

  // Profile update action
  const updateProfile = async (formData) => {
    try {
      const response = await api.post('/api/auth.php?action=update_profile', formData);
      if (response.data.success) {
        setUser(response.data.data.user);
      }
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || "Profile update failed.";
      return { success: false, message: msg };
    }
  };

  // Change password action
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await api.post('/api/auth.php?action=change_password', {
        current_password: currentPassword,
        new_password: newPassword
      });
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || "Password update failed.";
      return { success: false, message: msg };
    }
  };

  // Forgot password action
  const forgotPassword = async (email) => {
    try {
      const response = await api.post('/api/auth.php?action=forgot', { email });
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || "Forgot password initiation failed.";
      return { success: false, message: msg };
    }
  };

  // Reset password action
  const resetPassword = async (email, tokenValue, password) => {
    try {
      const response = await api.post('/api/auth.php?action=reset', {
        email,
        token: tokenValue,
        password
      });
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.message || "Reset password operation failed.";
      return { success: false, message: msg };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      theme,
      toggleTheme,
      login,
      register,
      logout,
      updateProfile,
      changePassword,
      forgotPassword,
      resetPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
