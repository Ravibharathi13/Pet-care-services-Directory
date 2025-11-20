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

  // ✅ API BASE URL FROM CLIENT .env
  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!initialized) {
      checkAuthStatus();
    }
  }, [initialized]);

  const checkAuthStatus = async () => {
    try {
      // ⭐ CHECK USER SESSION
      const response = await fetch(`${API}/user/me`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsAdmin(false);
      } else {
        setUser(null);

        // ⭐ CHECK ADMIN SESSION (CORRECT ENDPOINT)
        try {
          const adminRes = await fetch(`${API}/admin/me`, {
            credentials: 'include'
          });

          if (adminRes.ok) {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } catch {
          setIsAdmin(false);
        }
      }
    } catch (error) {
      console.log('Auth check failed:', error);
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
      await fetch(`${API}/user/logout`, {
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
