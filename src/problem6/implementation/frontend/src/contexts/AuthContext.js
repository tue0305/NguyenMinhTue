import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  
  // Configure axios to use the token for all requests
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);
  
  // Check if token is valid on startup
  useEffect(() => {
    async function checkAuthStatus() {
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        // This would be a real API endpoint to validate the token
        // For now, we'll assume the token is valid if it exists
        setCurrentUser({ username: localStorage.getItem('username') });
      } catch (error) {
        console.error('Auth validation error:', error);
        logout();
      } finally {
        setLoading(false);
      }
    }
    
    checkAuthStatus();
  }, [token]);
  
  async function login(username, password) {
    try {
      const response = await axios.post('/api/auth/login', {
        username,
        password
      });
      
      const { token } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('username', username);
      
      setToken(token);
      setCurrentUser({ username });
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  }
  
  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setToken(null);
    setCurrentUser(null);
  }
  
  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    login,
    logout,
    loading
  };
  
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}