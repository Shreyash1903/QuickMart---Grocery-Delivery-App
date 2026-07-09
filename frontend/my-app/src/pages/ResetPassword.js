import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { toast } from "react-toastify";
import "./ResetPassword.css";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const email = localStorage.getItem("resetEmail");
    const otp = localStorage.getItem("resetOtp");

    if (!email || !otp) {
      navigate("/forgot-password", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      toast.warning("⚠️ Password must be at least 6 characters long", {
        position: "top-right",
        autoClose: 3000,
      });
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      toast.warning("⚠️ Passwords do not match", {
        position: "top-right",
        autoClose: 3000,
      });
      setLoading(false);
      return;
    }

    try {
      const email = localStorage.getItem("resetEmail");
      const otp = localStorage.getItem("resetOtp");

      const response = await axios.post("/reset-password", {
        email,
        otp,
        password,
      });
      
      setMessage(response.data.message);
      localStorage.removeItem("resetEmail");
      localStorage.removeItem("resetOtp");
      
      // ✅ Success Toast
      toast.success("🔒 Password reset successfully! Please login.", {
        position: "top-right",
        autoClose: 4000,
      });
      
      setTimeout(() => {
        navigate("/login");
      }, 2500);
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

  const getPasswordStrength = (pass) => {
    if (pass.length === 0) return { label: "", color: "", width: 0 };
    if (pass.length < 6) return { label: "Weak", color: "#ff6b6b", width: 33 };
    if (pass.length < 10) return { label: "Medium", color: "#ffd93d", width: 66 };
    return { label: "Strong", color: "#0c831f", width: 100 };
  };

  const strength = getPasswordStrength(password);

  return (
    <div className="reset-wrapper">
      <div className="reset-container">
        <div className="reset-card">
          {/* ===== HEADER ===== */}
          <div className="reset-card-header">
            <div className="header-icon">🔐</div>
            <h2>Reset Password</h2>
            <p>Create a new password for your account</p>
          </div>

          {/* ===== BODY ===== */}
          <div className="reset-card-body">
            {message && <div className="alert alert-success">{message}</div>}
            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
              {/* ===== NEW PASSWORD ===== */}
              <div className="form-group">
                <label>New Password</label>
                <div className="input-wrapper password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
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
                
                {/* Password Strength */}
                {password.length > 0 && (
                  <div className="password-strength">
                    <div className="strength-header">
                      <span className="strength-label">Password Strength:</span>
                      <span className="strength-value" style={{ color: strength.color }}>
                        {strength.label}
                      </span>
                    </div>
                    <div className="strength-bar">
                      <div
                        className="strength-fill"
                        style={{
                          width: `${strength.width}%`,
                          background: strength.color,
                        }}
                      ></div>
                    </div>
                    <div className="strength-hints">
                      <span className={password.length >= 6 ? 'hint-done' : 'hint'}>
                        {password.length >= 6 ? '✅' : '○'} Min 6 characters
                      </span>
                      <span className={password.length >= 10 ? 'hint-done' : 'hint'}>
                        {password.length >= 10 ? '✅' : '○'} Strong password
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* ===== CONFIRM PASSWORD ===== */}
              <div className="form-group">
                <label>Confirm Password</label>
                <div className="input-wrapper password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                {confirmPassword.length > 0 && password === confirmPassword && (
                  <span className="password-match">
                    ✅ Passwords match
                  </span>
                )}
                {confirmPassword.length > 0 && password !== confirmPassword && (
                  <span className="password-mismatch">
                    ❌ Passwords do not match
                  </span>
                )}
              </div>

              {/* ===== SUBMIT BUTTON ===== */}
              <button type="submit" className="reset-submit-btn" disabled={loading}>
                {loading ? (
                  <>
                    <span className="btn-spinner"></span> Resetting...
                  </>
                ) : (
                  <>
                    <i className="bi bi-arrow-repeat"></i> Reset Password
                  </>
                )}
              </button>
            </form>

            {/* ===== FOOTER ===== */}
            <div className="reset-footer">
              <p>
                <span onClick={() => navigate("/login")} className="reset-back-link">
                  <i className="bi bi-arrow-left"></i> Back to Login
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;