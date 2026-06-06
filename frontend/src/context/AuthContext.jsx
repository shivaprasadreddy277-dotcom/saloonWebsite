import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize and check localStorage for existing session
  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = localStorage.getItem('luxecut_user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          // Configure axios default header
          axios.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
          
          // Verify token validity by calling profile endpoint
          const response = await axios.get('/api/auth/profile');
          
          // Refresh user details (retain token)
          const updatedUser = { ...response.data, token: parsedUser.token };
          setUser(updatedUser);
          localStorage.setItem('luxecut_user', JSON.stringify(updatedUser));
        } catch (error) {
          console.error('Session expired or invalid:', error.message);
          // Clear session
          localStorage.removeItem('luxecut_user');
          delete axios.defaults.headers.common['Authorization'];
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Login handler
  const login = async (email, password) => {
    const response = await axios.post('/api/auth/login', { email, password });
    const userData = response.data;
    
    // Save to localStorage & state
    localStorage.setItem('luxecut_user', JSON.stringify(userData));
    axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
    setUser(userData);
    return userData;
  };

  // Register handler
  const register = async (name, email, password, phone) => {
    const response = await axios.post('/api/auth/register', { name, email, password, phone });
    const userData = response.data;
    
    // Save to localStorage & state
    localStorage.setItem('luxecut_user', JSON.stringify(userData));
    axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
    setUser(userData);
    return userData;
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('luxecut_user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAdmin: user?.role === 'admin'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
export default AuthContext;
