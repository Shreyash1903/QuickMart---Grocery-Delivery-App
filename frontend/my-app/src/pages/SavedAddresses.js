import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  deleteAddress,
  getAddresses,
  setDefaultAddress,
} from "../api/address";
import { toast } from "react-toastify";
import "./SavedAddresses.css";

function SavedAddresses() {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const data = await getAddresses();
      setAddresses(data.addresses || []);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load addresses",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  // Auto-hide success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // ✅ FIXED: Navigate to edit page
  const handleEdit = (addressId) => {
    navigate(`/edit-address/${addressId}`);
  };

  const handleDelete = async (addressId) => {
    try {
      await deleteAddress(addressId);
      await loadAddresses();
      setSuccessMessage("Address deleted successfully! 🗑️");
      toast.info("🗑️ Address deleted successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Failed to delete address";
      setError(errorMsg);
      toast.error(`❌ ${errorMsg}`, {
        position: "top-right",
        autoClose: 4000,
      });
    }
    setDeleteConfirm(null);
  };

  const handleSetDefault = async (addressId) => {
    try {
      await setDefaultAddress(addressId);
      await loadAddresses();
      setSuccessMessage("Default address updated! ⭐");
      toast.success("⭐ Default address updated!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Failed to update default address";
      setError(errorMsg);
      toast.error(`❌ ${errorMsg}`, {
        position: "top-right",
        autoClose: 4000,
      });
    }
  };

  const getAddressIcon = (type) => {
    switch (type) {
      case "Home":
        return "🏠";
      case "Work":
        return "💼";
      case "Other":
        return "📍";
      default:
        return "📍";
    }
  };

  if (loading) {
    return (
      <div className="address-page-shell">
        <div className="address-loading">
          <div className="address-loading-spinner"></div>
          <p>Loading your addresses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="address-page-shell saved-addresses-page">
      {/* ===== HEADER ===== */}
      <div className="address-page-header">
        <div className="address-header-left">
          <h1>
            <i className="bi bi-bookmark-check"></i> Saved Addresses
          </h1>
          <span className="address-count">
            {addresses.length} addresses saved
          </span>
        </div>

        <div className="address-header-actions">
          <button
            className="address-secondary-btn"
            onClick={() => navigate("/address")}
            type="button"
          >
            <i className="bi bi-plus-circle"></i> Add New Address
          </button>

          <button
            className="address-secondary-btn"
            onClick={() => navigate("/checkout")}
            type="button"
          >
            <i className="bi bi-bag-check"></i> Checkout
          </button>
        </div>
      </div>

      {/* ===== SUCCESS TOAST ===== */}
      {successMessage && (
        <div className="address-success-toast">
          <span>{successMessage}</span>
        </div>
      )}

      {/* ===== ERROR ===== */}
      {error && <div className="address-page-error">{error}</div>}

      {/* ===== DELETE CONFIRMATION MODAL ===== */}
      {deleteConfirm && (
        <div className="delete-confirm-overlay">
          <div className="delete-confirm-modal">
            <div className="delete-confirm-icon">🗑️</div>
            <h3>Delete Address?</h3>
            <p>
              Are you sure you want to delete this address? This action cannot
              be undone.
            </p>
            <div className="delete-confirm-actions">
              <button
                className="delete-confirm-cancel"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button
                className="delete-confirm-proceed"
                onClick={() => handleDelete(deleteConfirm)}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== ADDRESS LIST ===== */}
      <div className="address-list-wrapper">
        <section className="address-list-card">
          <div className="section-heading">
            <h2>
              <i className="bi bi-bookmark-check"></i> Your Saved Addresses
            </h2>
            <p>
              {addresses.length} address{addresses.length === 1 ? "" : "es"} saved
            </p>
          </div>

          {!addresses.length ? (
            <div className="address-empty-state">
              <div className="empty-icon">📍</div>
              <h3>No addresses yet</h3>
              <p>Add your first delivery address using the form.</p>
              <button
                className="address-primary-btn"
                onClick={() => navigate("/address")}
                style={{ maxWidth: '250px', marginTop: '10px' }}
              >
                <i className="bi bi-plus-circle"></i> Add Address
              </button>
            </div>
          ) : (
            <div className="address-cards">
              {addresses.map((address, index) => (
                <article
                  key={address._id}
                  className={`address-card ${address.isDefault ? "default" : ""}`}
                  style={{ "--delay": `${index * 0.05}s` }}
                >
                  <div className="address-card-top">
                    <div className="address-card-header">
                      <h3>
                        <span className="address-icon">
                          {getAddressIcon(address.addressType)}
                        </span>
                        {address.fullName}
                      </h3>
                      <span className="address-type-tag">
                        {address.addressType}
                      </span>
                    </div>

                    {address.isDefault && (
                      <span className="default-badge">
                        <i className="bi bi-star-fill"></i> Default
                      </span>
                    )}
                  </div>

                  <div className="address-card-body">
                    <p className="address-mobile">
                      <i className="bi bi-phone"></i> {address.mobileNumber}
                    </p>
                    <p className="address-detail">
                      <i className="bi bi-door-open"></i> {address.houseNo},{" "}
                      {address.area}
                    </p>
                    {address.landmark && (
                      <p className="address-landmark">
                        <i className="bi bi-pin-map"></i> {address.landmark}
                      </p>
                    )}
                    <p className="address-city">
                      <i className="bi bi-building"></i> {address.city},{" "}
                      {address.state} - {address.pincode}
                    </p>
                  </div>

                  <div className="address-card-actions">
                    {/* ✅ FIXED: Navigate to edit page with address ID */}
                    <button
                      className="action-btn edit-btn"
                      type="button"
                      onClick={() => handleEdit(address._id)}
                    >
                      <i className="bi bi-pencil"></i> Edit
                    </button>

                    <button
                      className="action-btn delete-btn"
                      type="button"
                      onClick={() => setDeleteConfirm(address._id)}
                    >
                      <i className="bi bi-trash3"></i> Delete
                    </button>

                    {!address.isDefault && (
                      <button
                        className="action-btn default-btn"
                        type="button"
                        onClick={() => handleSetDefault(address._id)}
                      >
                        <i className="bi bi-star"></i> Make Default
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default SavedAddresses;