import { useUser } from "../contexts/UserContext";
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children, adminOnly = false, redirectTo = "/login" }) {
  const { user, loading, isAdmin } = useUser();
  const location = useLocation();

  // Minimal fallback while checking authentication (no big spinner)
  if (loading) return null;

  // If user is not authenticated, redirect to login
  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check if admin access is required but user is not admin
  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // User is authenticated and has required permissions
  return children;
}
