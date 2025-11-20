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
      // Check normal user session
      const response = await fetch(`${API}/user/me`, { credentials: 'include' });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsAdmin(false);
        return;
      }

      // Check admin session (CORRECT ENDPOINT)
      const adminRes = await fetch(`${API}/auth/me`, { credentials: 'include' });

      if (adminRes.ok) {
        setIsAdmin(true);
        return;
      }

      // No session found
      setUser(null);
      setIsAdmin(false);

    } catch (error) {
      console.log("Auth check failed:", error);
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
  };

  const logout = async () => {
    try {
      await fetch(`${API}/user/logout`, {
        method: "POST",
        credentials: "include"
      });
    } catch (error) {
      console.log("Logout failed:", error);
    } finally {
      setUser(null);
      setIsAdmin(false);
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isAdmin,
        loading,
        login,
        logout,
        isAuthenticated: (!loading && (user || isAdmin))
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
