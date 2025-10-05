import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "../../components/AuthLayout";
import "../../styles/AdminLogin.css";

export default function AdminLogin() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to admin dashboard on successful login
        navigate('/admin');
      } else {
        setError(data.message || 'Admin login failed');
      }
    } catch (error) {
      console.error('Admin login error:', error);
      setError('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="admin-login__wrapper">
        <section className="admin-login">
          <header className="admin-login__header">
            <h1 className="admin-login__header-title">Pet Care Admin</h1>
            <p className="admin-login__header-subtitle">Secure access to the admin dashboard</p>
          </header>

          <div className="admin-login__body">
            {error && (
              <div className="admin-login__alert" role="alert">
                <svg fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="admin-login__form">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="admin@petcare.com"
                  required
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
              </div>

              <div className="admin-login__actions">
                <button
                  type="submit"
                  disabled={loading}
                  className="admin-login__submit-btn"
                >
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </div>
            </form>
          </div>

          <footer className="admin-login__footer">
            <Link to="/" className="admin-login__footer-link">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Return to Home
            </Link>
          </footer>
        </section>
      </div>
    </AuthLayout>
  );
}
