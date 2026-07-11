import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaEnvelope,
  FaShieldAlt,
  FaCalendarAlt,
  FaEdit,
  FaArrowLeft,
  FaUserCircle,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { getAdminProfile } from "../api/adminApi";
import "./AdminProfile.css";

function AdminProfile() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAdminProfile();
  }, []);

  const fetchAdminProfile = async () => {
    try {
      setLoading(true);
      const response = await getAdminProfile();
      setAdmin(response.data.user);
      setError("");
    } catch (err) {
      setError("Error loading profile");
      toast.error("❌ Error loading profile");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getInitials = (name) => {
    if (!name) return "A";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error || !admin) {
    return (
      <div className="profile-error">
        <div className="error-icon">😕</div>
        <h3>Failed to load profile</h3>
        <p>{error || "Admin not found"}</p>
        <button className="profile-retry-btn" onClick={fetchAdminProfile}>
          <i className="bi bi-arrow-repeat"></i> Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* ===== HEADER ===== */}
      <div className="profile-header">
        <div className="profile-header-left">
          <button className="back-btn" onClick={() => navigate("/admin")}>
            <FaArrowLeft /> Back to Dashboard
          </button>
          <h1 className="profile-title">
            <FaUser className="title-icon" />
            Admin Profile
          </h1>
        </div>
        <button
          className="edit-profile-btn"
          onClick={() => navigate("/admin/edit-profile")}
        >
          <FaEdit /> Edit Profile
        </button>
      </div>

      {/* ===== PROFILE CARD ===== */}
      <div className="profile-card">
        <div className="profile-avatar-wrapper">
          <div className="profile-avatar">{getInitials(admin.name)}</div>
          <div className="profile-avatar-badge">
            <FaShieldAlt />
          </div>
        </div>

        <div className="profile-info">
          <h2 className="profile-name">{admin.name}</h2>
          <span className="profile-role-badge">
            <FaShieldAlt /> Administrator
          </span>
        </div>

        <div className="profile-details-grid">
          <div className="profile-detail-item">
            <div className="detail-icon-wrapper">
              <FaEnvelope />
            </div>
            <div className="detail-content">
              <span className="detail-label">Email</span>
              <span className="detail-value">{admin.email}</span>
            </div>
          </div>

          <div className="profile-detail-item">
            <div className="detail-icon-wrapper">
              <FaUser />
            </div>
            <div className="detail-content">
              <span className="detail-label">Role</span>
              <span className="detail-value role-admin">
                <FaShieldAlt /> {admin.role || "Admin"}
              </span>
            </div>
          </div>

          <div className="profile-detail-item">
            <div className="detail-icon-wrapper">
              <FaCalendarAlt />
            </div>
            <div className="detail-content">
              <span className="detail-label">Joined</span>
              <span className="detail-value">
                {formatDate(admin.createdAt)}
              </span>
            </div>
          </div>

          <div className="profile-detail-item">
            <div className="detail-icon-wrapper">
              <FaUserCircle />
            </div>
            <div className="detail-content">
              <span className="detail-label">Status</span>
              <span className="detail-value status-active">
                <span className="status-dot"></span> Active
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default AdminProfile;
