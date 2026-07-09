// ➡️ React aur useState import kiya state management ke liye.
import React, { useState } from "react";

// ➡️ React Router ke useNavigate aur Link import kiya navigation aur linking ke liye.
import { useNavigate, Link } from "react-router-dom";

// ➡️ loginUser() normal login API call karta hai.
// ➡️ googleLogin() Google OAuth backend API call karta hai.
import { loginUser, googleLogin } from "../api/axios";
import { toast } from "react-toastify";
import "./login.css";

// ✅ Google OAuth Client ID
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || "";

// Login component
function Login({ onLoginSuccess, isModal = false }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();

  // ===== BUILD ADMIN REDIRECT URL =====
  const buildAdminRedirectUrl = (token) => {
    const adminBaseUrl =
      process.env.REACT_APP_ADMIN_URL || "http://localhost:3001";
    const normalizedAdminUrl = adminBaseUrl.endsWith("/admin")
      ? adminBaseUrl
      : `${adminBaseUrl.replace(/\/$/, "")}/admin`;

    return `${normalizedAdminUrl}?token=${encodeURIComponent(token)}`;
  };

  // ===== REDIRECT AFTER LOGIN =====
  const redirectAfterLogin = (user, token) => {
    console.log("🔄 redirectAfterLogin called");
    console.log("👤 User:", user);

    // ✅ Check if user is admin
    if (user?.role === "admin") {
      // ✅ Admin ko Admin Panel par bhejo
      const fullUrl = buildAdminRedirectUrl(token);
      console.log("🌐 Admin URL:", fullUrl);
      
      // ✅ Admin panel open karo (same tab mein)
      window.location.href = fullUrl;
      return;
    }

    // ✅ Regular user - Home page par bhejo
    console.log("👤 Regular user - navigating to /home");
    navigate("/home");
  };

  // ===== NORMAL LOGIN =====
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Login API call
      const response = await loginUser({ email, password });

      // console.log("✅ Login Response:", response);
      // console.log("👤 User role:", response.user.role);

      // ✅ Save token & user data
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));

      // Welcome Toast
      toast.success(`👋 Welcome back, ${email.split("@")[0]}!`, {
        position: "top-right",
        autoClose: 3000,
      });

      // If Login Modal
      if (onLoginSuccess) {
        onLoginSuccess(response.user, response.token);
        return;
      }

      // ✅ Redirect based on role
      redirectAfterLogin(response.user, response.token);
      
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Login failed";
      setError(errorMsg);
      toast.error(`❌ ${errorMsg}`, {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  // ===== GOOGLE LOGIN =====
  const handleGoogleLogin = () => {
    if (!GOOGLE_CLIENT_ID) {
      toast.error("Google login is not configured yet.", {
        position: "top-right",
        autoClose: 4000,
      });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      console.log("Google client ID:", GOOGLE_CLIENT_ID);
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCallback,
        cancel_on_tap_outside: false,
      });

      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed()) {
          toast.warning("⚠️ Google login popup blocked. Please allow popups.", {
            position: "top-right",
          });
        }
      });
    };
  };

  const handleGoogleCallback = async (response) => {
    try {
      setGoogleLoading(true);

      const res = await googleLogin(response.credential);

      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));

      toast.success(`👋 Welcome ${res.user.name}!`, {
        position: "top-right",
        autoClose: 3000,
      });

      if (onLoginSuccess) {
        onLoginSuccess(res.user, res.token);
      } else {
        redirectAfterLogin(res.user, res.token);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Google login failed";
      setError(errorMsg);
      toast.error(`❌ ${errorMsg}`, {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  // ===== MODAL VERSION =====
  if (isModal) {
    return (
      <div className="login-modal-inner">
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit} autoComplete="none">
          <div className="mb-4">
            <label className="form-label fw-bold">Email</label>
            <div className="custom-modal-input">
              <i className="bi bi-envelope"></i>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label fw-bold">Password</label>
            <div className="custom-modal-input">
              <i className="bi bi-lock"></i>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                <i
                  className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}
                ></i>
              </button>
            </div>
          </div>

          <div className="forgot-password-link">
            <Link to="/forgot-password">Forgot Password ?</Link>
          </div>

          <button type="submit" className="modal-login-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="btn-spinner"></span> Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>
      </div>
    );
  }

  // ===== FULL PAGE VERSION =====
  return (
    <div className="login-wrapper">
      <div className="login-container">
        <div className="login-brand">
          <div className="brand-icon">🛒</div>
          <h1 className="brand-name">
            Quick<span>Mart</span>
          </h1>
        </div>

        <div className="login-card">
          <div className="login-card-header">
            <h2>Welcome Back !</h2>
            <p>Sign in to continue shopping</p>
          </div>

          <div className="login-card-body">
            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email Address</label>
                <div className="input-wrapper">
                  <i className="bi bi-envelope"></i>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Password</label>
                <div className="input-wrapper password-wrapper">
                  <i className="bi bi-lock"></i>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i
                      className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}
                    ></i>
                  </button>
                </div>
              </div>

              <div className="form-options">
                <label className="remember-me">
                  <input type="checkbox" />
                  <span>Remember me</span>
                </label>
                <Link to="/forgot-password" className="forgot-link">
                  Forgot Password ?
                </Link>
              </div>

              <button
                type="submit"
                className="login-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="btn-spinner"></span> Logging in...
                  </>
                ) : (
                  <>
                    <i className="bi bi-box-arrow-in-right"></i> Sign In
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="login-card-footer">
            <p>
              Don't have an account ?{" "}
              <Link to="/register" className="register-link">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;