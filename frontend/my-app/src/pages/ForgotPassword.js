import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { toast } from "react-toastify";
import "./ForgotPassword.css";

const ForgotPassword = React.memo(
  ({ isModal = false, onSuccess, onCancel }) => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
      e.preventDefault();
      setMessage("");
      setError("");
      setLoading(true);

      try {
        const response = await API.post("/forgot-password", { email });
        setMessage(response.data.message);
        localStorage.setItem("resetEmail", email);

        // ✅ Success Toast
        toast.success(`📧 OTP sent to ${email}`, {
          position: "top-right",
          autoClose: 4000,
        });

        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          } else {
            navigate("/verify-otp");
          }
        }, 2000);
      } catch (err) {
        const errorMsg = err.response?.data?.message || "An error occurred";
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
        <div className="forgot-modal-inner">
          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleSubmit} autoComplete="off">
            <div className="mb-4">
              <label className="form-label fw-bold">
                Enter your registered email to receive an OTP
              </label>
              <div className="custom-modal-input">
                <i className="bi bi-envelope"></i>
                <input
                  type="email"
                  placeholder="e.g., name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="modal-login-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="btn-spinner"></span> Submitting...
                </>
              ) : (
                "Send OTP"
              )}
            </button>
          </form>
        </div>
      );
    }

    return (
      <div className="forgot-wrapper">
        <div className="forgot-container">
          {/* ===== BRAND ===== */}
          <div className="forgot-brand">
            <div className="brand-icon">🔑</div>
            <h1 className="brand-name">
              Quick<span>Mart</span>
            </h1>
          </div>

          <div className="forgot-card">
            <div className="forgot-card-header">
              <h2>Forgot Password?</h2>
              <p>Enter your email to receive a password reset OTP</p>
            </div>

            <div className="forgot-card-body">
              {message && <div className="alert alert-success">{message}</div>}
              {error && <div className="alert alert-danger">{error}</div>}

              <form onSubmit={handleSubmit} autoComplete="off">
                <div className="form-group">
                  <label>
                    <i className="bi bi-envelope"></i> Email Address
                  </label>
                  <div className="input-wrapper">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="forgot-submit-btn" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="btn-spinner"></span> Sending...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-send"></i> Send OTP
                    </>
                  )}
                </button>
              </form>

              <div className="forgot-footer">
                <p>
                  Remember your password?{" "}
                  <span onClick={() => navigate("/login")} className="forgot-back-link">
                    Back to Login
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

export default ForgotPassword;