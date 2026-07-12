import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  addAddress,
  getAddresses,
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
  const [addresses, setAddresses] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
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
    setSelectedLocationText("");
  };

  const handleMapLocationSelect = (locationData) => {
    const address = locationData.address || {};
    
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
      await addAddress(formData);
      setSuccessMessage("Address added successfully! ✅");
      toast.success("📍 New address added successfully!", {
        position: "top-right",
        autoClose: 3000,
      });

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
            <i className="bi bi-geo-alt-fill"></i> Add New Address
          </h1>
          <span className="address-count">
            {addresses.length} addresses saved
          </span>
        </div>

        <div className="address-header-actions">
          <button
            className="address-secondary-btn view-addresses-btn"
            onClick={() => navigate("/saved-addresses")}
            type="button"
          >
            <i className="bi bi-bookmark-check"></i> View Saved Addresses
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

      {/* ===== MAP + FORM SIDE BY SIDE ===== */}
      <div className="address-add-grid">
        
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
              <i className="bi bi-plus-circle"></i> Add New Address
            </h2>
            <p>Fill in the fields below to save a new address.</p>
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
                  Saving...
                </>
              ) : (
                <>
                  <i className="bi bi-plus-circle"></i>
                  Save Address
                </>
              )}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

export default Address;