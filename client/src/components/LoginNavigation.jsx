import { Link } from 'react-router-dom';
import "../styles/LoginNavigation.css";

export default function LoginNavigation() {
  return (
    <nav className="nav">
      <div className="nav-container">
        <div className="nav-brand">
          <Link to="/" className="nav-brand__link">
            <h2 className="nav-brand__title">🐾 Pet Care Finder</h2>
          </Link>
        </div>

        <div className="nav-actions">
          <Link 
            to="/admin/login" 
            className="admin-btn"
          >
            Admin Login
          </Link>
        </div>
      </div>
    </nav>
  );
}
