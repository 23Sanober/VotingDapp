import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);


export const AuthProvider = ({ children }) => {
  
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const storedAuth = localStorage.getItem('isAuthenticated');
    return storedAuth === 'true'; 
  });

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    
    const storedAdminAuth = localStorage.getItem('isAdminAuthenticated');
    return storedAdminAuth === 'true';
  });

  
  useEffect(() => {
    localStorage.setItem('isAuthenticated', isAuthenticated);
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('isAdminAuthenticated', isAdminAuthenticated);
  }, [isAdminAuthenticated]);

  // Login for users
  const login = () => setIsAuthenticated(true);

  // Login for admins
  const loginAdmin = () => setIsAdminAuthenticated(true);

  // Logout function for both users and admins
  const logout = () => {
    setIsAuthenticated(false);
    setIsAdminAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('isAdminAuthenticated');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isAdminAuthenticated, login, loginAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;