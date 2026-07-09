import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { toast } from "react-toastify";
import "./VerifyOtp.css";

const VerifyOtp = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [resendLoading, setResendLoading] = useState(false);
  const navigate = useNavigate();

  const inputRefs = [];

  useEffect(() => {
    const email = localStorage.getItem("resetEmail");
    if (!email) {
      navigate("/forgot-password", { replace: true });
    }
  }, [navigate]);

  // Timer for resend OTP
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length < 6) {
      const errorMsg = "Please enter the complete 6-digit OTP";
      setError(errorMsg);
      toast.warning(`⚠️ ${errorMsg}`, {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const email = localStorage.getItem("resetEmail");
      const response = await API.post("/verify-otp", {
        email,
        otp: otpString,
      });

      localStorage.setItem("resetOtp", otpString);
      setMessage(response.data.message);

      // ✅ Success Toast
      toast.success("✅ OTP verified successfully!", {
        position: "top-right",
        autoClose: 3000,
      });

      setTimeout(() => {
        navigate("/reset-password");
      }, 1200);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Invalid OTP. Please try again.";
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

  const handleResendOtp = async () => {
    try {
      setResendLoading(true);
      const email = localStorage.getItem("resetEmail");
      await API.post("/forgot-password", { email });
      setTimer(60);
      setMessage("OTP resent successfully!");
      setError("");
      
      // ✅ Success Toast
      toast.success("📧 OTP resent successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (err) {
      const errorMsg = "Failed to resend OTP. Please try again.";
      setError(errorMsg);
      
      // ❌ Error Toast
      toast.error(`❌ ${errorMsg}`, {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="forgot-wrapper">
      <div className="forgot-container">
        <div className="forgot-card">
          <div className="forgot-card-header">
            <h2>Verify OTP</h2>
            <p>Enter the 6-digit code sent to your email</p>
          </div>

          <div className="forgot-card-body">
            {message && <div className="alert alert-success">{message}</div>}
            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="otp-input-group">
                <label>Enter OTP</label>
                <div className="otp-inputs">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs[index] = el)}
                      type="text"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="otp-input"
                      autoFocus={index === 0}
                    />
                  ))}
                </div>
              </div>

              <div className="otp-timer">
                {timer > 0 ? (
                  <span>Resend OTP in <strong>{timer}s</strong></span>
                ) : (
                  <button
                    type="button"
                    className="resend-btn"
                    onClick={handleResendOtp}
                    disabled={resendLoading}
                  >
                    {resendLoading ? "Sending..." : "Resend OTP"}
                  </button>
                )}
              </div>

              <button type="submit" className="forgot-submit-btn" disabled={loading}>
                {loading ? (
                  <>
                    <span className="btn-spinner"></span> Verifying...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle"></i> Verify OTP
                  </>
                )}
              </button>
            </form>

            <div className="forgot-footer">
              <p>
                <span onClick={() => navigate("/forgot-password")} className="forgot-back-link">
                  ← Back to Forgot Password
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;