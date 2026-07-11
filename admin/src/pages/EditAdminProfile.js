import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaArrowLeft,
  FaSave,
  FaLock,
  FaUser,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import {
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
} from "../api/adminApi";
import "./EditAdminProfile.css";

function EditAdminProfile() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await getAdminProfile();
      setFormData({
        name: response.data?.user?.name || "",
        email: response.data?.user?.email || "",
      });
    } catch (error) {
      toast.error("❌ Could not load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await updateAdminProfile(formData);
      toast.success("✅ Profile updated successfully");
      navigate("/admin/profile");
    } catch (error) {
      toast.error(error.message || "❌ Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("❌ New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("❌ Password must be at least 6 characters");
      return;
    }

    try {
      await changeAdminPassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      toast.success("✅ Password changed successfully");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error(error.message || "❌ Failed to change password");
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="edit-profile-container">
      {/* ===== HEADER ===== */}
      <div className="edit-profile-header">
        <div className="edit-profile-header-left">
          <button
            className="back-btn"
            onClick={() => navigate("/admin/profile")}
          >
            <FaArrowLeft /> Back to Profile
          </button>
          <h1 className="edit-profile-title">
            <FaUser className="title-icon" /> Edit Profile
          </h1>
        </div>
      </div>

      {/* ===== TWO CARDS SIDE BY SIDE ===== */}
      <div className="edit-profile-grid">
        {/* ===== CARD 1: PROFILE INFORMATION ===== */}
        <div className="edit-profile-card profile-info-card">
          <div className="card-header">
            <div className="card-header-icon">
              <FaUser />
            </div>
            <h3>Profile Information</h3>
            <span className="card-badge">Edit</span>
          </div>

          <form onSubmit={handleProfileSubmit} className="edit-profile-form">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="Enter your email address"
                required
              />
            </div>

            <button
              type="submit"
              className="save-profile-btn"
              disabled={saving}
            >
              <FaSave /> {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>

        {/* ===== CARD 2: CHANGE PASSWORD ===== */}
        <div className="edit-profile-card password-card">
          <div className="card-header">
            <div className="card-header-icon password-icon">
              <FaLock />
            </div>
            <h3>Change Password</h3>
            <span className="card-badge security">Secure</span>
          </div>

          <form onSubmit={handlePasswordSubmit} className="edit-profile-form">
            <div className="form-group">
              <label htmlFor="currentPassword">Current Password</label>
              <div className="password-input-wrapper">
                <input
                  id="currentPassword"
                  type={showPassword.current ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                  placeholder="Enter current password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => togglePasswordVisibility("current")}
                >
                  {showPassword.current ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <div className="password-input-wrapper">
                <input
                  id="newPassword"
                  type={showPassword.new ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  placeholder="Enter new password (min 6 characters)"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => togglePasswordVisibility("new")}
                >
                  {showPassword.new ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <span className="hint">
                Password must be at least 6 characters
              </span>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <div className="password-input-wrapper">
                <input
                  id="confirmPassword"
                  type={showPassword.confirm ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  placeholder="Confirm new password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => togglePasswordVisibility("confirm")}
                >
                  {showPassword.confirm ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button type="submit" className="update-password-btn">
              <FaLock /> Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditAdminProfile;
