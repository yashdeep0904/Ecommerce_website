import React, { createContext, useContext, useState } from 'react';
import { authApi } from '../api/authApi';
import { useNavigate } from 'react-router-dom'; // Add this

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('shophub_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('shophub_user', JSON.stringify(userData));
  };

  const logout = async (navigate) => { // Accept navigate here
    try {
      await authApi.logoutUser();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setUser(null);
      localStorage.removeItem('shophub_user');
      navigate('/login'); // Use navigate instead of window.location
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);