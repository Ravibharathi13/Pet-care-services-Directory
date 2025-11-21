import React from "react";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";
import AuthLayout from "../../components/AuthLayout";
import "../../styles/UserLogin.css";

export default function UserLogin() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useUser();
  
  // Get the intended destination from location state
  const from = location.state?.from?.pathname || "/";

  // Remove the automatic redirect check to prevent navigation loops
  // The UserContext will handle authentication state

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear errors when user starts typing
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (!isLogin && !formData.name) {
      setError('Please enter your full name');
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        // 1) Try admin login first
        try {
          const adminRes = await fetch('http://localhost:5000/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email: formData.email, password: formData.password })
          });
          // If admin login succeeds, go to admin dashboard
          if (adminRes.ok) {
            navigate('/admin', { replace: true });
            return;
          }
        } catch (_) {
          // Ignore network error here; will attempt user login next
        }

        // 2) Fallback to normal user login
        const userRes = await fetch('http://localhost:5000/user/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email: formData.email, password: formData.password })
        });
        const userData = await userRes.json();
        if (userRes.ok) {
          login(userData.user);
          navigate(from, { replace: true });
        } else {
          setError(userData.message || 'Authentication failed');
        }
      } else {
        // Registration flow remains unchanged
        const regRes = await fetch('http://localhost:5000/user/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(formData)
        });
        const regData = await regRes.json();
        if (regRes.ok) {
          login(regData.user);
          navigate(from, { replace: true });
        } else {
          setError(regData.message || 'Registration failed');
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError('Unable to connect to server. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      name: "",
      email: "",
      password: "",
      phone: ""
    });
    // Clear error and success messages when switching modes
    setError("");
    setSuccess("");
  };

  return (
    <AuthLayout headerCentered backgroundImage="/dog2.jpg" backgroundSize="100% 100%" backgroundPosition="center top">
      <div className="user-login">
          {/* Title */}
          <div className="user-login__title" style={{padding: '24px 24px 8px', textAlign: 'center'}}>
            <h1 style={{margin: 0}}>Pet Care</h1>
            <p>
              {isLogin ? "Sign in to your account" : "Create your account"}
            </p>
          </div>

          {/* Messages */}
          {error && (
            <div className="user-login__message user-login__message--error">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Success visual removed to avoid large verification panel */}

          {/* Form */}
          <form onSubmit={handleSubmit} className="user-login__form">
            {!isLogin && (
              <div className="form-group mb-6">
                <label htmlFor="name">
                  Full Name
                </label>
                <div className="input-icon-wrapper">
                  <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm0 2c-3.866 0-7 3.134-7 7a1 1 0 001 1h12a1 1 0 001-1c0-3.866-3.134-7-7-7z" />
                  </svg>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input-with-icon"
                    placeholder="John Doe"
                    required={!isLogin}
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            <div className="form-group mb-6">
              <label htmlFor="email">
                Email Address
              </label>
              <div className="input-icon-wrapper">
                <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M2 6.5A2.5 2.5 0 014.5 4h15A2.5 2.5 0 0122 6.5v11A2.5 2.5 0 0119.5 20h-15A2.5 2.5 0 012 17.5v-11zm2.4.5l7.1 5 7.1-5H4.4zm15.1 2.2l-6.6 4.7a1.5 1.5 0 01-1.8 0L4.5 9.2V17a.5.5 0 00.5.5h14a.5.5 0 00.5-.5V9.2z" />
                </svg>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input-with-icon"
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group mb-6">
              <div className="flex items-center justify-between mb-1" style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: '4px'}}>
                <label htmlFor="password">
                  Password
                </label>
              </div>
              <div className="input-icon-wrapper">
                <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M17 8V7a5 5 0 10-10 0v1H5a1 1 0 00-1 1v10a1 1 0 001 1h14a1 1 0 001-1V9a1 1 0 00-1-1h-2zm-8 0V7a3 3 0 116 0v1H9z" />
                </svg>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="input-with-icon"
                  placeholder={isLogin ? "Enter your password" : "Create a password"}
                  required
                  minLength="6"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                />
              </div>
              {/* Forgot password option removed */}
            </div>

            {!isLogin && (
              <div className="form-group mb-6">
                <label htmlFor="phone">
                  Phone Number (Optional)
                </label>
                <div className="input-icon-wrapper">
                  <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.36 11.36 0 003.56.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.36 11.36 0 00.57 3.56 1 1 0 01-.24 1.01l-2.2 2.2z" />
                  </svg>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="input-with-icon"
                    placeholder="+91 9876543210"
                    autoComplete="tel"
                  />
                </div>
              </div>
            )}

            {/* Social login removed */}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="user-login__submit-btn"
              >
                {loading ? (isLogin ? 'Signing in...' : 'Creating account...') : (isLogin ? 'Sign In to Your Account' : 'Create Account')}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="user-login__footer">
            {isLogin ? (
              <p className="text-sm text-center text-gray-600">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="user-login__alt-btn user-login__alt-btn--primary"
                >
                  Sign up now
                </button>
              </p>
            ) : (
              <p className="text-sm text-center text-gray-600">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="user-login__alt-btn user-login__alt-btn--outline"
                >
                  Sign in
                </button>
              </p>
            )}
            </div>
          </div>
      </AuthLayout>
    );
  }
