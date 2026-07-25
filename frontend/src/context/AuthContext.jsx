import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // 1. Initialize user state from local storage
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(true);

  // Stop loading immediately after mount
  useEffect(() => {
    setIsLoading(false);
  }, []);

  // 3. DEFINE THE LOGIN FUNCTION
  const login = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  }, [setUser]); 

  // 4. DEFINE THE LOGOUT FUNCTION
  const logout = useCallback(() => {
    console.warn("Logout triggered. Clearing user session.");
    setUser(null);
    localStorage.removeItem('user');
    window.location.href = '/login'; 
  }, [setUser]); 

  // 5. Listen for the 'session-expired' event from axiosConfig.js
  useEffect(() => {
    const handleSessionExpired = () => {
      console.error("Session expired event received! Forcing user to login screen.");
      logout(); 
    };

    window.addEventListener('session-expired', handleSessionExpired);
    
    return () => {
      window.removeEventListener('session-expired', handleSessionExpired);
    };
  }, [logout]); 

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// 🟢 CRITICAL FIX: Failsafe to prevent React crashes if providers are in the wrong order
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(
      "❌ useAuth was called outside of AuthProvider! " + 
      "Check your App.jsx or main.jsx and ensure <CartProvider> is nested INSIDE <AuthProvider>."
    );
  }
  return context;
};