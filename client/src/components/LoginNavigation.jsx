import { Link } from 'react-router-dom';
import "../styles/LoginNavigation.css";

export default function LoginNavigation({ center = false }) {
  return (
    <nav className="nav">
      <div className="nav-container" style={center ? { justifyContent: 'center' } : undefined}>
        <div className="nav-brand" style={center ? { margin: 0 } : undefined}>
          <Link to="/" className="nav-brand__link">
            <h2 className="nav-brand__title">🐾 Pet Care Finder</h2>
          </Link>
        </div>
      </div>
    </nav>
  );
}
