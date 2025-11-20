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

  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!initialized) {
      checkAuthStatus();
    }
  }, [initialized]);

  const checkAuthStatus = async () => {
    try {
      // 1) Check USER session
      const userRes = await fetch(`${API}/user/me`, { credentials: 'include' });

      if (userRes.ok) {
        const data = await userRes.json();
        setUser(data.user);
        setIsAdmin(false);
      } else {
        setUser(null);

        // 2) Check ADMIN session (old system)
        const adminRes = await fetch(`${API}/auth/me`, { credentials: 'include' });

        if (adminRes.ok) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      }
    } catch (err) {
      setUser(null);
      setIsAdmin(false);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  };

  const login = (userData, isAdminLogin = false) => {
    if (isAdminLogin) {
      setIsAdmin(true);
      setUser(null);
    } else {
      setUser(userData);
      setIsAdmin(false);
    }
    setLoading(false);
  };

  const logout = async () => {
    try {
      await fetch(`${API}/user/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      await fetch(`${API}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (_) {}

    setUser(null);
    setIsAdmin(false);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAdmin,
    isAuthenticated: (!loading && (!!user || isAdmin)),
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
