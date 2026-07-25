import React, { createContext, useContext, useEffect, useState } from 'react';
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

  // const logout = async (navigate) => { // Accept navigate here
  //   try {
  //     await authApi.logoutUser();
  //   } catch (err) {
  //     console.error("Logout error:", err);
  //   } finally {
  //     setUser(null);
  //     localStorage.removeItem('shophub_user');
  //     navigate('/login'); // Use navigate instead of window.location
  //   }
  // };

  // We listen for the 'session-expired' event that Axios sends.
  useEffect(() => {
    const handleSessionExpired = () => {
      logout(); // Call YOUR specific logout function here!
    };

    window.addEventListener('session-expired', handleSessionExpired);
    
    return () => {
      window.removeEventListener('session-expired', handleSessionExpired);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout,setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);