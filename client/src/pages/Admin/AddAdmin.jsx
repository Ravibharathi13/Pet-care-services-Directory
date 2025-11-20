import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../../components/AuthLayout";
import "../../styles/UserLogin.css";

export default function AddAdmin() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!form.email || !form.password) {
      setError("Please fill in required fields");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("https://pet-care-services-directory-server.onrender.com/auth/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("New admin created successfully");
        // small delay then go back to dashboard
        setTimeout(() => navigate("/admin", { replace: true }), 800);
      } else {
        setError(data?.message || "Failed to create admin");
      }
    } catch (err) {
      setError("Unable to connect to server. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout headerCentered showSideDecor>
      <div className="user-login">
        {/* Title */}
        <div className="user-login__title" style={{padding: '24px 24px 8px', textAlign: 'center'}}>
          <h1 style={{margin: 0}}>Add New Admin</h1>
          <p>Create an admin account</p>
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
        {success && (
          <div className="user-login__message" style={{background:'#ecfdf5', color:'#065f46', borderColor:'#10b981'}}>
            <span>{success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="user-login__form">
          <div className="form-group mb-6">
            <label htmlFor="name">Full Name</label>
            <div className="input-icon-wrapper">
              <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm0 2c-3.866 0-7 3.134-7 7a1 1 0 001 1h12a1 1 0 001-1c0-3.866-3.134-7-7-7z" />
              </svg>
              <input
                type="text"
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="input-with-icon"
                placeholder="Jane Admin"
                autoComplete="name"
              />
            </div>
          </div>

          <div className="form-group mb-6">
            <label htmlFor="email">Email Address *</label>
            <div className="input-icon-wrapper">
              <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M2 6.5A2.5 2.5 0 014.5 4h15A2.5 2.5 0 0122 6.5v11A2.5 2.5 0 0119.5 20h-15A2.5 2.5 0 012 17.5v-11zm2.4.5l7.1 5 7.1-5H4.4zm15.1 2.2l-6.6 4.7a1.5 1.5 0 01-1.8 0L4.5 9.2V17a.5.5 0 00.5.5h14a.5.5 0 00.5-.5V9.2z" />
              </svg>
              <input
                type="email"
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="input-with-icon"
                placeholder="admin@example.com"
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group mb-6">
            <label htmlFor="password">Password *</label>
            <div className="input-icon-wrapper">
              <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17 8V7a5 5 0 10-10 0v1H5a1 1 0 00-1 1v10a1 1 0 001 1h14a1 1 0 001-1V9a1 1 0 00-1-1h-2zm-8 0V7a3 3 0 116 0v1H9z" />
              </svg>
              <input
                type="password"
                id="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="input-with-icon"
                placeholder="StrongP@ssw0rd"
                required
                minLength="6"
                autoComplete="new-password"
              />
            </div>
          </div>

          <div>
            <button type="submit" disabled={loading} className="user-login__submit-btn">
              {loading ? 'Creating admin...' : 'Create Admin'}
            </button>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}
