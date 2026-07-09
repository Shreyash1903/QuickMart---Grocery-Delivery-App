import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import "./register.css";
import { toast } from "react-toastify";

function Register({ onRegisterSuccess, isModal = false }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await API.post("/registration", {
        name,
        email,
        password,
      });

      // ✅ Success Toast
      toast.success(`🎉 Welcome ${name.split(' ')[0]}! Registration successful!`, {
        position: "top-right",
        autoClose: 3000,
      });

      if (onRegisterSuccess) {
        onRegisterSuccess();
      } else {
        // Navigate to login after 2 seconds
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Registration failed";
      setError(errorMsg);
      
      // ❌ Error Toast
      toast.error(`❌ ${errorMsg}`, {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  if (isModal) {
    return (
      <div className="register-modal-inner">
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit} autoComplete="none">
          <div className="mb-4">
            <label className="form-label fw-bold">Full Name</label>
            <div className="custom-modal-input">
              <i className="bi bi-person"></i>
              <input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

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
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
              </button>
            </div>
          </div>

          <button type="submit" className="modal-login-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="btn-spinner"></span> Signing up...
              </>
            ) : (
              "Sign up"
            )}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="register-wrapper">
      <div className="register-container">
        <div className="register-brand">
          <div className="brand-icon">📝</div>
          <h1 className="brand-name">
            Quick<span>Cart</span>
          </h1>
        </div>

        <div className="register-card">
          <div className="register-card-header">
            <h2>Create Account</h2>
            <p>Join us and start shopping today!</p>
          </div>

          <div className="register-card-body">
            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <div className="input-wrapper">
                  <i className="bi bi-person"></i>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

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
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                  </button>
                </div>
              </div>

              <button type="submit" className="register-submit-btn" disabled={loading}>
                {loading ? (
                  <>
                    <span className="btn-spinner"></span> Signing up...
                  </>
                ) : (
                  <>
                    <i className="bi bi-person-plus"></i> Create Account
                  </>
                )}
              </button>
            </form>

            <div className="register-divider">
              <span>or continue with</span>
            </div>

            <div className="social-register">
              <button className="social-btn google">
                <i className="bi bi-google"></i> Google
              </button>
              <button className="social-btn facebook">
                <i className="bi bi-facebook"></i> Facebook
              </button>
            </div>
          </div>

          <div className="register-card-footer">
            <p>
              Already have an account?{" "}
              <Link to="/login" className="login-link">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;