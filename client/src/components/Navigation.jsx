import { Link, useLocation } from "react-router-dom";
import { useUser } from "../contexts/UserContext";

export default function Navigation() {
  const location = useLocation();
  const { user, logout, isAuthenticated } = useUser();
  
  const handleLogout = async () => {
    await logout();
  };
  
  return (
    <nav className="nav">
      <div className="nav-container">
        <div className="nav-brand">
          <h2>🐾 Pet Care Finder</h2>
        </div>
        
        <div className="nav-links">
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
          >
            🏠 Home
          </Link>
          
          {isAuthenticated ? (
            <div className="user-nav-section">
              <span className="user-greeting">👋 Welcome, {user?.name}!</span>
              <button 
                onClick={handleLogout}
                className="nav-link logout-btn"
              >
                🚪 Logout
              </button>
            </div>
          ) : (
            <Link 
              to="/login" 
              className={`nav-link ${location.pathname === "/login" ? "active" : ""}`}
            >
              🔐 Login
            </Link>
          )}
          
          {location.pathname.startsWith("/admin") && location.pathname !== "/admin/login" && (
            <Link 
              to="/admin" 
              className={`nav-link ${location.pathname === "/admin" ? "active" : ""}`}
            >
              📊 Dashboard
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
