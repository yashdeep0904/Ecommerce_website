import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(false);
  }, []);

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

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    // Optional: redirect them to login page when logged out
    window.location.href = '/login'; 
  };

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