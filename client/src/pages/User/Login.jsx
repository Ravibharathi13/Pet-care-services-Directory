import React from "react";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";
import AuthLayout from "../../components/AuthLayout";
import "../../styles/UserLogin.css";

const API = import.meta.env.VITE_API_URL;   // ✅ your .env value

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
  
  const from = location.state?.from?.pathname || "/";

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

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
        // 👉 ADMIN LOGIN
        try {
          const adminRes = await fetch(`${API}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ email: formData.email, password: formData.password })
          });

          if (adminRes.ok) {
            navigate("/admin", { replace: true });
            return;
          }
        } catch (_) {}

        // 👉 USER LOGIN
        const userRes = await fetch(`${API}/user/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email: formData.email, password: formData.password })
        });

        const userData = await userRes.json();

        if (userRes.ok) {
          login(userData.user);
          navigate(from, { replace: true });
        } else {
          setError(userData.message || "Authentication failed");
        }

      } else {
        // 👉 USER REGISTER
        const regRes = await fetch(`${API}/user/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(formData)
        });

        const regData = await regRes.json();

        if (regRes.ok) {
          login(regData.user);
          navigate(from, { replace: true });
        } else {
          setError(regData.message || "Registration failed");
        }
      }

    } catch (error) {
      console.error("Auth error:", error);
      setError("Unable to connect to server. Please check your connection.");
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
    setError("");
    setSuccess("");
  };

  return (
    <AuthLayout headerCentered backgroundImage="/dog2.jpg" backgroundSize="100% 100%" backgroundPosition="center top">
      <div className="user-login">
        
        <div className="user-login__title" style={{padding: "24px 24px 8px", textAlign: "center"}}>
          <h1 style={{margin: 0}}>Pet Care</h1>
          <p>{isLogin ? "Sign in to your account" : "Create your account"}</p>
        </div>

        {error && (
          <div className="user-login__message user-login__message--error">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="user-login__form">
          
          {!isLogin && (
            <div className="form-group mb-6">
              <label htmlFor="name">Full Name</label>
              <div className="input-icon-wrapper">
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input-with-icon"
                  placeholder="John Doe"
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          <div className="form-group mb-6">
            <label htmlFor="email">Email Address</label>
            <div className="input-icon-wrapper">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="input-with-icon"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div className="form-group mb-6">
            <label htmlFor="password">Password</label>
            <div className="input-icon-wrapper">
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
              />
            </div>
          </div>

          {!isLogin && (
            <div className="form-group mb-6">
              <label htmlFor="phone">Phone Number (Optional)</label>
              <div className="input-icon-wrapper">
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="input-with-icon"
                  placeholder="+91 9876543210"
                />
              </div>
            </div>
          )}

          <div>
            <button type="submit" disabled={loading} className="user-login__submit-btn">
              {loading ? (isLogin ? "Signing in..." : "Creating account...") : (isLogin ? "Sign In to Your Account" : "Create Account")}
            </button>
          </div>
        </form>

        <div className="user-login__footer">
          {isLogin ? (
            <p className="text-sm text-center text-gray-600">
              Don't have an account?{" "}
              <button type="button" onClick={toggleMode} className="user-login__alt-btn user-login__alt-btn--primary">
                Sign up now
              </button>
            </p>
          ) : (
            <p className="text-sm text-center text-gray-600">
              Already have an account?{" "}
              <button type="button" onClick={toggleMode} className="user-login__alt-btn user-login__alt-btn--outline">
                Sign in
              </button>
            </p>
          )}
        </div>

      </div>
    </AuthLayout>
  );
}
