// pages/EditUser.js

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserById, updateUser } from "../api/usersApi";
import {
  FaArrowLeft,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaUserTag,
  FaCheckCircle,
  FaTimesCircle,
  FaSave,
  FaSpinner,
} from "react-icons/fa";
import { toast } from "react-toastify";
import "./EditUser.css";

function EditUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "user",
    isActive: true,
  });

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const res = await getUserById(id);
      const user = res.user;
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        role: user.role || "user",
        isActive: user.isActive !== undefined ? user.isActive : true,
      });
      setError("");
    } catch (err) {
      console.error("Error fetching user:", err);
      setError("Failed to load user details");
      toast.error("❌ Failed to load user details");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("❌ Name is required");
      return;
    }

    try {
      setSaving(true);
      await updateUser(id, {
        name: formData.name.trim(),
        role: formData.role,
        isActive: formData.isActive,
      });
      toast.success("✅ User updated successfully!");
      navigate(`/admin/users/${id}`);
    } catch (err) {
      console.error("Error updating user:", err);
      toast.error("❌ Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="edit-user-loading">
        <div className="loading-spinner"></div>
        <p>Loading user details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="edit-user-error">
        <p>{error}</p>
        <button onClick={() => navigate("/admin/users")} className="back-btn">
          <FaArrowLeft /> Back to Users
        </button>
      </div>
    );
  }

  return (
    <div className="edit-user-container">
      {/* ===== HEADER ===== */}
      <div className="edit-user-header">
        <button
          onClick={() => navigate(`/admin/users/${id}`)}
          className="back-btn"
        >
          <FaArrowLeft /> Back to User
        </button>
        <h1 className="edit-user-title">Edit User</h1>
        <div className="header-spacer"></div>
      </div>

      {/* ===== FORM ===== */}
      <form className="edit-user-form" onSubmit={handleSubmit}>
        <div className="form-card">
          <h3 className="form-section-title">Basic Information</h3>

          <div className="form-group">
            <label htmlFor="name">
              <FaUser className="input-icon" />
              Full Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter full name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">
              <FaEnvelope className="input-icon" />
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              disabled
              className="disabled-input"
            />
            <small className="field-hint">Email cannot be changed</small>
          </div>

          <div className="form-group">
            <label htmlFor="phone">
              <FaPhone className="input-icon" />
              Phone
            </label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={formData.phone}
              disabled
              className="disabled-input"
            />
            <small className="field-hint">Phone cannot be changed</small>
          </div>
        </div>

        <div className="form-card">
          <h3 className="form-section-title">Account Settings</h3>

          <div className="form-group">
            <label htmlFor="role">
              <FaUserTag className="input-icon" />
              Role
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="user">User</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
              />
              <span className="checkbox-custom">
                {formData.isActive ? <FaCheckCircle /> : <FaTimesCircle />}
              </span>
              <span className="checkbox-text">
                {formData.isActive ? "Active" : "Inactive"}
              </span>
            </label>
            <small className="field-hint">
              {formData.isActive
                ? "User can log in and place orders"
                : "User cannot log in or place orders"}
            </small>
          </div>
        </div>

        {/* ===== ACTIONS ===== */}
        <div className="form-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate(`/admin/users/${id}`)}
          >
            Cancel
          </button>
          <button type="submit" className="save-btn" disabled={saving}>
            {saving ? (
              <>
                <FaSpinner className="spinning" /> Saving...
              </>
            ) : (
              <>
                <FaSave /> Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditUser;
