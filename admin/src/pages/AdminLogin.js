import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminLogin } from "../api/usersApi"; // ← Updated import path
import { toast } from "react-toastify";
import "./AdminLogin.css";

function AdminLogin({ setIsAuthenticated }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await adminLogin({ email, password });
      const { token, user } = response;

      if (user?.role !== "admin") {
        toast.error("Only admin users can login here.", {
          position: "top-right",
          autoClose: 3000,
          className: "toast-error",
        });
        setLoading(false);
        return;
      }

      localStorage.setItem("adminToken", token);
      setIsAuthenticated?.(true);
      toast.success("Welcome back, Admin! 🎉", {
        position: "top-right",
        autoClose: 2500,
        className: "toast-success",
      });
      navigate("/admin");
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Login failed";
      toast.error(errorMsg, {
        position: "top-right",
        autoClose: 3000,
        className: "toast-error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-container">
        <div className="admin-login-card">
          {/* Brand/Logo Section */}
          <div className="login-header">
            <div className="login-logo">
              <svg
                width="48"
                height="48"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="48" height="48" rx="12" fill="#10b981" />
                <path
                  d="M24 14L26.5 19.5L32.5 20.5L28 25L29 31L24 28L19 31L20 25L15.5 20.5L21.5 19.5L24 14Z"
                  fill="white"
                />
                <circle cx="24" cy="24" r="2" fill="#10b981" />
              </svg>
              <span className="logo-text">QuickMart</span>
            </div>
            <span className="badge-admin">Admin Panel</span>
          </div>

          <h2>Welcome Back</h2>
          <p className="login-subtitle">Sign in to manage your store</p>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 4.5L8 8.5L14 4.5M2 3H14C14.5523 3 15 3.44772 15 4V12C15 12.5523 14.5523 13 14 13H2C1.44772 13 1 12.5523 1 12V4C1 3.44772 1.44772 3 2 3Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@example.com"
                className="login-input"
              />
            </div>

            <div className="form-group">
              <label>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4 6V4C4 1.79086 5.79086 0 8 0C10.2091 0 12 1.79086 12 4V6M3 6H13C13.5523 6 14 6.44772 14 7V13C14 14.1046 13.1046 15 12 15H4C2.89543 15 2 14.1046 2 13V7C2 6.44772 2.44772 6 3 6Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Password
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="login-input"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path
                        d="M2.5 10C2.5 10 5 4.5 10 4.5C15 4.5 17.5 10 17.5 10C17.5 10 15 15.5 10 15.5C5 15.5 2.5 10 2.5 10Z"
                        stroke="#6B7280"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle
                        cx="10"
                        cy="10"
                        r="2.5"
                        stroke="#6B7280"
                        strokeWidth="1.5"
                      />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path
                        d="M2.5 10C2.5 10 5 4.5 10 4.5C15 4.5 17.5 10 17.5 10C17.5 10 15 15.5 10 15.5C5 15.5 2.5 10 2.5 10Z"
                        stroke="#6B7280"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12.5 10C12.5 11.3807 11.3807 12.5 10 12.5C8.61929 12.5 7.5 11.3807 7.5 10C7.5 8.61929 8.61929 7.5 10 7.5C11.3807 7.5 12.5 8.61929 12.5 10Z"
                        stroke="#6B7280"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M17.5 2.5L2.5 17.5"
                        stroke="#EF4444"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" defaultChecked />
                <span>Remember me</span>
              </label>
              <a href="#" className="forgot-password">
                Forgot password?
              </a>
            </div>

            <button type="submit" disabled={loading} className="login-button">
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>

        {/* Decorative Side Panel */}
        <div className="login-side-panel">
          <div className="side-panel-content">
            <h2>Admin Dashboard</h2>
            <p>Manage your products, orders, and users from one place</p>
            <div className="features-list">
              <div className="feature-item">
                <span className="feature-icon">📦</span>
                <div>
                  <h4>Product Management</h4>
                  <p>Add, edit, and delete products</p>
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🛒</span>
                <div>
                  <h4>Order Tracking</h4>
                  <p>Monitor and update order status</p>
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-icon">👥</span>
                <div>
                  <h4>User Management</h4>
                  <p>Manage customers and their accounts</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
