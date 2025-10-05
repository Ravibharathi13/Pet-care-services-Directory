import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function AdminProtectedRoute({ children, redirectTo = "/admin/login" }) {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let active = true;
    const checkAdmin = async () => {
      try {
        const res = await fetch("http://localhost:5000/auth/me", { credentials: "include" });
        if (!active) return;
        if (res.ok) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (e) {
        if (!active) return;
        setIsAdmin(false);
      } finally {
        if (active) setLoading(false);
      }
    };
    checkAdmin();
    return () => { active = false; };
  }, [location.pathname]);

  if (loading) return null;

  if (!isAdmin) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return children;
}
