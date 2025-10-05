import { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized) {
      checkAuthStatus();
    }
  }, [initialized]);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('http://localhost:5000/user/me', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.log('User not authenticated');
      setUser(null);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  };

  const login = (userData) => {
    setUser(userData);
    setLoading(false);
  };

  const logout = async () => {
    try {
      await fetch('http://localhost:5000/user/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user && !loading
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
