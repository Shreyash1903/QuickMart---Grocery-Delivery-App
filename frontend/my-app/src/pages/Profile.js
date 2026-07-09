import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API, { changePassword, updateProfile } from "../api/axios";
import "./profile.css";

function Profile({ user, getUserData }) {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      if (user?.name || user?.email) {
        setName(user?.name || "");
        setEmail(user?.email || "");
        return;
      }

      try {
        const response = await API.get("/me");
        setName(response.data.user?.name || "");
        setEmail(response.data.user?.email || "");
      } catch (error) {
        console.error("Failed to load profile:", error);
      }
    };

    loadProfile();
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    try {
      setProfileLoading(true);
      await updateProfile({ name });

      toast.success("Profile updated successfully", {
        position: "top-right",
      });

      if (getUserData) {
        await getUserData();
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(error.response?.data?.message || "Failed to update profile", {
        position: "top-right",
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      toast.warning("Password must be at least 6 characters", {
        position: "top-right",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match", {
        position: "top-right",
      });
      return;
    }

    try {
      setPasswordLoading(true);
      await changePassword({ currentPassword, newPassword });

      toast.success("Password changed successfully", {
        position: "top-right",
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Password change error:", error);
      toast.error(
        error.response?.data?.message || "Failed to change password",
        {
          position: "top-right",
        },
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-shell">
        <div className="profile-hero">
          <span className="profile-badge">My Account</span>
          <h1>Profile Settings</h1>
          <p>
            Update your personal information and change your password securely.
          </p>
        </div>

        <div className="profile-grid">
          <section className="profile-card">
            <div className="profile-card-header">
              <h2>Personal Details</h2>
              <span>Editable profile information</span>
            </div>

            <form onSubmit={handleProfileSubmit} className="profile-form">
              <div className="profile-avatar">
                <span>{name ? name.charAt(0).toUpperCase() : "U"}</span>
              </div>

              <div className="field-group">
                <label>Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  required
                />
              </div>

              <div className="field-group">
                <label>Email</label>
                <input type="email" value={email} disabled />
                <small>Email cannot be changed here.</small>
              </div>

              <button
                type="submit"
                className="profile-submit-btn"
                disabled={profileLoading}
              >
                {profileLoading ? "Saving..." : "Save Profile"}
              </button>
            </form>
          </section>

          <section className="profile-card">
            <div className="profile-card-header">
              <h2>Change Password</h2>
              <span>Keep your account secure</span>
            </div>

            <form onSubmit={handlePasswordSubmit} className="profile-form">
              <div className="field-group">
                <label>Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Current password"
                  required
                />
              </div>

              <div className="field-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password"
                  required
                />
              </div>

              <div className="field-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                />
              </div>

              <button
                type="submit"
                className="profile-submit-btn secondary"
                disabled={passwordLoading}
              >
                {passwordLoading ? "Updating..." : "Change Password"}
              </button>
            </form>
          </section>
        </div>

        <div className="profile-footer-actions">
          <button
            type="button"
            className="back-btn"
            onClick={() => navigate(-1)}
          >
            <i className="bi bi-arrow-left"></i> Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
