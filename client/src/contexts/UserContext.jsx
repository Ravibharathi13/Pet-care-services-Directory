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
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!initialized) {
      checkAuthStatus();
    }
  }, [initialized]);

  const checkAuthStatus = async () => {
    try {
      // 1) Check normal user session
      const response = await fetch(`${import.meta.env.VITE_API_URL}/user/me`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsAdmin(false);
      } else {
        setUser(null);
        // 2) Fallback: check admin session
        try {
          const adminRes = await fetch(`${import.meta.env.VITE_API_URL}/admin/me`, { credentials: 'include' });
          if (adminRes.ok) {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } catch (_) {
          setIsAdmin(false);
        }
      }
    } catch (error) {
      console.log('User not authenticated');
      setUser(null);
      setIsAdmin(false);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  };

  const login = (userData) => {
    setUser(userData);
    setIsAdmin(false);
    setLoading(false);
  };

  const logout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/user/logout`, {
  method: 'POST',
  credentials: 'include'
});

    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAdmin(false);
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAdmin,
    isAuthenticated: (!loading && (!!user || isAdmin))
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
