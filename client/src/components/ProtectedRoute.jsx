import { useEffect, useState } from "react";
import { useUser } from "../contexts/UserContext";
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children, adminOnly = false, redirectTo = "/login" }) {
  const { user, loading, login } = useUser();
  const [adminOk, setAdminOk] = useState(false);
  const [checking, setChecking] = useState(true);
  const location = useLocation();

  useEffect(() => {
    let active = true;
    const run = async () => {
      try {
        // 1) Check admin first
        const adminRes = await fetch("http://localhost:5000/auth/me", { credentials: "include" });
        if (!active) return;
        if (adminRes.ok) {
          setAdminOk(true);
          return; // admin session present -> allow
        }

        // 2) If no admin, rely on user context; if empty and not loading, try user/me once
        if (!user && !loading) {
          try {
            const userRes = await fetch("http://localhost:5000/user/me", { credentials: "include" });
            if (!active) return;
            if (userRes.ok) {
              const data = await userRes.json();
              login(data.user);
            }
          } catch (_) { /* ignore */ }
        }
      } finally {
        if (active) setChecking(false);
      }
    };

    run();
    return () => { active = false; };
  }, [user, loading, location.pathname, login]);

  if (loading || checking) return null;

  // Allow if authenticated user
  if (user) return children;

  // Allow if admin session exists (for general routes)
  if (!adminOnly && adminOk) return children;

  return <Navigate to={redirectTo} state={{ from: location }} replace />;
}
