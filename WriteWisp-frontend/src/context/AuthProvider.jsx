import { useState, useEffect } from 'react';
import ApiService from '../services/api';
import { AuthContext } from './AuthContext';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const userData = localStorage.getItem('writewisp_user');
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error('Error loading user from localStorage:', error);
        localStorage.removeItem('writewisp_user');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    const response = await ApiService.login(credentials);
    const userData = {
      id: response.userID,
      username: response.username,
      email: credentials.email,
      token: response.token,
    };
    
    localStorage.setItem('writewisp_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const signup = async (userData) => {
    await ApiService.signup(userData);
    return await login({
      email: userData.email,
      password: userData.password,
    });
  };

  const logout = () => {
    localStorage.removeItem('writewisp_user');
    setUser(null);
  };

  const updateUser = (userData) => {
    const updatedUser = { ...user, ...userData };
    localStorage.setItem('writewisp_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const value = {
    user,
    login,
    signup,
    logout,
    updateUser,
    isAuthenticated: !!user,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};