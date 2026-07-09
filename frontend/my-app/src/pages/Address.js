import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  addAddress,
  deleteAddress,
  getAddresses,
  setDefaultAddress,
  updateAddress,
} from "../api/address";
import MapPicker from "../components/MapPicker";
import { toast } from "react-toastify";
import "./address.css";

const emptyForm = {
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
};

function Address() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");

  const [addresses, setAddresses] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedLocationText, setSelectedLocationText] = useState("");

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

  // Handle edit from query param
  useEffect(() => {
    if (editId && addresses.length > 0) {
      const addressToEdit = addresses.find((a) => a._id === editId);
      if (addressToEdit) {
        handleEdit(addressToEdit);
        navigate("/address", { replace: true });
      }
    }
  }, [editId, addresses]);

  // Auto-hide success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setSelectedLocationText("");
  };

  // In Address.js - Update this function
const handleMapLocationSelect = (locationData) => {
  console.log("📍 Location data received:", locationData);
  
  const address = locationData.address || {};
  
  // Extract address components with fallbacks
  const areaValue =
    address.road ||
    address.neighbourhood ||
    address.suburb ||
    address.city_district ||
    address.village ||
    address.town ||
    address.hamlet ||
    "";

  const cityValue =
    address.city ||
    address.town ||
    address.village ||
    address.county ||
    address.municipality ||
    address.city_district ||
    "";

  const stateValue = address.state || address.region || "";
  const pincodeValue = address.postcode || address.postal_code || "";
  const houseValue = address.house_number || "";
  const landmarkValue = address.neighbourhood || address.suburb || address.landmark || "";

  // Log extracted values
  console.log("📝 Extracted values:", {
    area: areaValue,
    city: cityValue,
    state: stateValue,
    pincode: pincodeValue,
    house: houseValue,
    landmark: landmarkValue
  });

  setFormData((current) => ({
    ...current,
    houseNo: houseValue || current.houseNo,
    area: areaValue || current.area,
    city: cityValue || current.city,
    state: stateValue || current.state,
    pincode: pincodeValue || current.pincode,
    landmark: landmarkValue || current.landmark,
    latitude: locationData.latitude,
    longitude: locationData.longitude,
  }));

  // Set display text
  const displayText = locationData.displayName ||
    `${cityValue || "Selected area"}, ${stateValue || ""}`.trim();

  setSelectedLocationText(displayText);

  toast.success("📍 Location selected from map!", {
    position: "top-right",
    autoClose: 2500,
  });
};

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (editingId) {
        await updateAddress(editingId, formData);
        setSuccessMessage("Address updated successfully! ✅");
        toast.success("📍 Address updated successfully!", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        await addAddress(formData);
        setSuccessMessage("Address added successfully! ✅");
        toast.success("📍 New address added successfully!", {
          position: "top-right",
          autoClose: 3000,
        });
      }

      await loadAddresses();
      resetForm();
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to save address";
      setError(errorMsg);
      toast.error(`❌ ${errorMsg}`, {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (address) => {
    setEditingId(address._id);
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

    setSelectedLocationText(
      address.latitude && address.longitude
        ? `Saved coordinates: ${address.latitude}, ${address.longitude}`
        : "",
    );

    window.scrollTo({ top: 0, behavior: "smooth" });
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

      if (editingId === addressId) {
        resetForm();
      }
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

  // Get address type icon
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
    <div className="address-page-shell">
      {/* ===== HEADER ===== */}
      <div className="address-page-header">
        <div className="address-header-left">
          <h1>
            <i className="bi bi-geo-alt-fill"></i> Manage Addresses
          </h1>
          <span className="address-count">
            {addresses.length} addresses saved
          </span>
        </div>

        <div className="address-header-actions">
          <button
            className="address-secondary-btn"
            onClick={() => navigate("/checkout")}
            type="button"
          >
            <i className="bi bi-bag-check"></i> Checkout
          </button>

          {editingId && (
            <button
              className="address-secondary-btn cancel-btn"
              onClick={resetForm}
              type="button"
            >
              <i className="bi bi-x-circle"></i> Cancel Edit
            </button>
          )}
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

      {/* ===== MAIN LAYOUT ===== */}
      <div className="address-page-layout">
        {/* ===== LEFT COLUMN ===== */}
        <div className="address-left-column">
          {/* ===== MAP CARD ===== */}
          <section className="address-map-card">
            <div className="section-heading">
              <h2>
                <i className="bi bi-map"></i> Pick Location
              </h2>
              <p>Click anywhere on the map or use current location.</p>
            </div>

            <div className="map-picker-block">
              <MapPicker
                onLocationSelect={handleMapLocationSelect}
                initialPosition={
                  formData.latitude && formData.longitude
                    ? [Number(formData.latitude), Number(formData.longitude)]
                    : undefined
                }
                showLocationButton={true}
              />

              {selectedLocationText && (
                <div className="selected-location-text">
                  <i className="bi bi-pin-map-fill"></i>
                  <span>{selectedLocationText}</span>
                </div>
              )}
            </div>
          </section>

          {/* ===== FORM CARD ===== */}
          <section className="address-form-card">
            <div className="section-heading">
              <h2>
                {editingId ? (
                  <>
                    <i className="bi bi-pencil-square"></i> Edit Address
                  </>
                ) : (
                  <>
                    <i className="bi bi-plus-circle"></i> Add New Address
                  </>
                )}
              </h2>
              <p>
                Fill in the fields below to {editingId ? "update" : "save"} an
                address.
              </p>
            </div>

            <form className="address-form" onSubmit={handleSubmit}>
              <div className="address-grid">
                <div className="form-group">
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

                <div className="form-group">
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

                <div className="form-group">
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

                <div className="form-group">
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

                <div className="form-group">
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

                <div className="form-group">
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

                <div className="form-group">
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

                <div className="form-group">
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

                <div className="form-group full-width">
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

              <label className="default-toggle">
                <input
                  type="checkbox"
                  name="isDefault"
                  checked={formData.isDefault}
                  onChange={handleChange}
                />
                <span>⭐ Set as default address</span>
              </label>

              <button
                className="address-primary-btn"
                type="submit"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="btn-spinner"></span>
                    {editingId ? "Updating..." : "Saving..."}
                  </>
                ) : (
                  <>
                    <i
                      className={`bi ${editingId ? "bi-pencil-square" : "bi-plus-circle"}`}
                    ></i>
                    {editingId ? "Update Address" : "Save Address"}
                  </>
                )}
              </button>
            </form>
          </section>
        </div>

        {/* ===== RIGHT COLUMN ===== */}
        <div className="address-right-column">
          <section className="address-list-card">
            <div className="section-heading">
              <h2>
                <i className="bi bi-bookmark-check"></i> Your Saved Addresses
              </h2>
              <p>
                {addresses.length} address{addresses.length === 1 ? "" : "es"}{" "}
                saved
              </p>
            </div>

            {!addresses.length ? (
              <div className="address-empty-state">
                <div className="empty-icon">📍</div>
                <h3>No addresses yet</h3>
                <p>Add your first delivery address using the form.</p>
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
                      <button
                        className="action-btn edit-btn"
                        type="button"
                        onClick={() => handleEdit(address)}
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
    </div>
  );
}

export default Address;