import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getAddressById,
  updateAddress,
} from "../api/address";
import { toast } from "react-toastify";
import "./EditAddress.css";

function EditAddress() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    mobileNumber: "",
    houseNo: "",
    area: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
    addressType: "Home",
    isDefault: false,
    latitude: "",
    longitude: "",
  });

  useEffect(() => {
    loadAddressDetails();
  }, [id]);

  const loadAddressDetails = async () => {
    try {
      setLoading(true);
      const response = await getAddressById(id);
      const address = response.address || response;
      
      setFormData({
        fullName: address.fullName || "",
        mobileNumber: address.mobileNumber || "",
        houseNo: address.houseNo || "",
        area: address.area || "",
        landmark: address.landmark || "",
        city: address.city || "",
        state: address.state || "",
        pincode: address.pincode || "",
        addressType: address.addressType || "Home",
        isDefault: Boolean(address.isDefault),
        latitude: address.latitude || "",
        longitude: address.longitude || "",
      });

      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load address details"
      );
      toast.error("❌ Failed to load address details", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      await updateAddress(id, formData);
      toast.success("✅ Address updated successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
      navigate("/saved-addresses");
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to update address";
      setError(errorMsg);
      toast.error(`❌ ${errorMsg}`, {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="edit-address-page">
        <div className="edit-address-loading">
          <div className="edit-address-loading-spinner"></div>
          <p>Loading address details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-address-page">
      
      {/* ===== HEADER - NEW LAYOUT ===== */}
      <div className="edit-address-header">
        {/* Row 1: Title only */}
        <div className="edit-address-header-top">
          <h1>
            <i className="bi bi-pencil-square"></i> Edit Address
          </h1>
        </div>

        {/* Row 2: All three buttons */}
        <div className="edit-address-header-bottom">
          <button
            className="edit-address-back-btn"
            onClick={() => navigate("/saved-addresses")}
            type="button"
          >
            <i className="bi bi-arrow-left"></i> Back to Saved Addresses
          </button>
          <button
            className="edit-address-secondary-btn add-new-btn"
            onClick={() => navigate("/address")}
            type="button"
          >
            <i className="bi bi-plus-circle"></i> Add New
          </button>
          <button
            className="edit-address-secondary-btn"
            onClick={() => navigate("/checkout")}
            type="button"
          >
            <i className="bi bi-bag-check"></i> Checkout
          </button>
        </div>
      </div>

      {/* ===== ERROR ===== */}
      {error && <div className="edit-address-error">{error}</div>}

      {/* ===== EDIT FORM ===== */}
      <div className="edit-address-form-wrapper">
        <section className="edit-address-form-card">
          <div className="edit-address-form-heading">
            <h2>
              <i className="bi bi-pencil-square"></i> Edit Address Details
            </h2>
            <p>Update the fields below to modify this address.</p>
          </div>

          <form className="edit-address-form" onSubmit={handleSubmit}>
            <div className="edit-address-grid">
              <div className="edit-form-group">
                <label>
                  <i className="bi bi-person"></i> Full Name
                  <input
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    placeholder="Enter your full name"
                  />
                </label>
              </div>

              <div className="edit-form-group">
                <label>
                  <i className="bi bi-phone"></i> Mobile Number
                  <input
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    required
                    placeholder="Enter mobile number"
                    type="tel"
                  />
                </label>
              </div>

              <div className="edit-form-group">
                <label>
                  <i className="bi bi-door-open"></i> House / Flat No.
                  <input
                    name="houseNo"
                    value={formData.houseNo}
                    onChange={handleChange}
                    required
                    placeholder="Enter house/flat number"
                  />
                </label>
              </div>

              <div className="edit-form-group">
                <label>
                  <i className="bi bi-signpost"></i> Area / Street
                  <input
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    required
                    placeholder="Enter area or street name"
                  />
                </label>
              </div>

              <div className="edit-form-group">
                <label>
                  <i className="bi bi-pin-map"></i> Landmark
                  <input
                    name="landmark"
                    value={formData.landmark}
                    onChange={handleChange}
                    placeholder="Enter landmark (optional)"
                  />
                </label>
              </div>

              <div className="edit-form-group">
                <label>
                  <i className="bi bi-building"></i> City
                  <input
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    placeholder="Enter city name"
                  />
                </label>
              </div>

              <div className="edit-form-group">
                <label>
                  <i className="bi bi-globe"></i> State
                  <input
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                    placeholder="Enter state name"
                  />
                </label>
              </div>

              <div className="edit-form-group">
                <label>
                  <i className="bi bi-mailbox"></i> Pincode
                  <input
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    required
                    placeholder="Enter pincode"
                    type="number"
                  />
                </label>
              </div>

              <div className="edit-form-group full-width">
                <label>
                  <i className="bi bi-tag"></i> Address Type
                  <select
                    name="addressType"
                    value={formData.addressType}
                    onChange={handleChange}
                  >
                    <option value="">Select address type</option>
                    <option value="Home">🏠 Home</option>
                    <option value="Work">💼 Work</option>
                    <option value="Other">📍 Other</option>
                  </select>
                </label>
              </div>
            </div>

            <label className="edit-default-toggle">
              <input
                type="checkbox"
                name="isDefault"
                checked={formData.isDefault}
                onChange={handleChange}
              />
              <span>⭐ Set as default address</span>
            </label>

            <div className="edit-form-actions">
              <button
                type="button"
                className="edit-cancel-btn"
                onClick={() => navigate("/saved-addresses")}
              >
                <i className="bi bi-x-circle"></i> Cancel
              </button>
              <button
                className="edit-primary-btn"
                type="submit"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="edit-btn-spinner"></span>
                    Updating...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle"></i>
                    Update Address
                  </>
                )}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

export default EditAddress;