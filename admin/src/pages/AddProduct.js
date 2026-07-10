import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { addProduct } from "../api/productsApi";
import { toast } from "react-toastify";
import {
  FaArrowLeft,
  FaSave,
  FaImage,
  FaUpload,
  FaTimes,
  FaBox,
  FaTag,
  FaRupeeSign,
  FaPercentage,
  FaClipboardList,
  FaToggleOn,
  FaToggleOff,
} from "react-icons/fa";
import "./AddProduct.css";

function AddProduct() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imageName, setImageName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    discountPrice: "",
    quantity: "",
    description: "",
    stock: "",
    isNew: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processImageFile(file);
  };

  const processImageFile = (file) => {
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      toast.error("❌ Please upload a valid image (JPEG, PNG, WEBP, GIF)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("❌ Image size should be less than 5MB");
      return;
    }

    setSelectedImage(file);
    setImageName(file.name);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImageName("");
    setImagePreview("");
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = "";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.category || formData.category.trim() === "") {
        toast.error("❌ Please enter a category");
        setLoading(false);
        return;
      }

      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("category", formData.category.trim());
      submitData.append("price", Number(formData.price));
      submitData.append("discountPrice", Number(formData.discountPrice) || 0);
      submitData.append("quantity", formData.quantity);
      submitData.append("description", formData.description);
      submitData.append("stock", Number(formData.stock) || 0);
      submitData.append("isNew", formData.isNew ? "true" : "false");

      if (selectedImage) {
        submitData.append("image", selectedImage);
      }

      await addProduct(submitData);

      toast.success("✅ Product added successfully!", {
        position: "top-right",
      });

      navigate("/admin/products");
    } catch (err) {
      console.error("Error adding product:", err);
      toast.error("❌ Failed to add product", {
        position: "top-right",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-product-container">
      {/* ===== HEADER ===== */}
      <div className="add-product-header">
        <button
          className="back-btn"
          onClick={() => navigate("/admin/products")}
        >
          <FaArrowLeft /> Back to Products
        </button>
        <h1 className="add-product-title">
          <span className="title-icon">✨</span>
          Add New Product
        </h1>
        <div className="header-spacer"></div>
      </div>

      {/* ===== FORM ===== */}
      <form className="add-product-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          {/* Left Column */}
          <div className="form-left">
            {/* Product Name */}
            <div className="form-group">
              <label>
                <FaBox className="input-icon" />
                Product Name <span className="required">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter product name"
                required
                className="form-input"
              />
            </div>

            {/* Category */}
            <div className="form-group">
              <label>
                <FaTag className="input-icon" />
                Category <span className="required">*</span>
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="Enter category name (e.g., Fruits & Vegetables)"
                required
                className="form-input"
              />
              <small className="form-hint">
                💡 You can enter any category name you want
              </small>
            </div>

            {/* Price & Discount */}
            <div className="form-row">
              <div className="form-group">
                <label>
                  <FaRupeeSign className="input-icon" />
                  Price (₹) <span className="required">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="199"
                  required
                  min="0"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>
                  <FaPercentage className="input-icon" />
                  Discount Price (₹)
                </label>
                <input
                  type="number"
                  name="discountPrice"
                  value={formData.discountPrice}
                  onChange={handleChange}
                  placeholder="149"
                  min="0"
                  className="form-input"
                />
              </div>
            </div>

            {/* Stock & Quantity */}
            <div className="form-row">
              <div className="form-group">
                <label>
                  <FaClipboardList className="input-icon" />
                  Stock <span className="required">*</span>
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="50"
                  required
                  min="0"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>
                  <FaBox className="input-icon" />
                  Quantity / Unit
                </label>
                <input
                  type="text"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="500 ml, 1 kg, 12 pieces"
                  className="form-input"
                />
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <label>
                <FaClipboardList className="input-icon" />
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter product description..."
                rows="4"
                className="form-textarea"
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="form-right">
            {/* Image Upload */}
            <div className="form-group image-upload-group">
              <label>
                <FaImage className="input-icon" />
                Product Image
              </label>

              <div className="image-upload">
                <input
                  type="file"
                  id="image-upload-input"
                  name="image"
                  accept="image/*"
                  onChange={handleImageChange}
                />

                <label htmlFor="image-upload-input" className="upload-btn">
                  <FaUpload /> Choose Image
                </label>

                <div
                  className={`image-preview ${imagePreview ? "has-image" : ""} ${isDragging ? "drag-over" : ""}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="Product preview" />
                      <button
                        type="button"
                        className="remove-image-btn"
                        onClick={handleRemoveImage}
                      >
                        <FaTimes />
                      </button>
                    </>
                  ) : (
                    <div className="image-placeholder">
                      <FaImage size={48} />
                      <span>Drop image here or click to upload</span>
                      <small>PNG, JPG, WEBP (max 5MB)</small>
                    </div>
                  )}
                </div>

                {imageName && (
                  <div className="image-upload-info">
                    <FaImage />
                    <span className="file-name">{imageName}</span>
                    <span className="file-size">
                      {(selectedImage?.size / 1024).toFixed(1)} KB
                    </span>
                    <button
                      type="button"
                      className="remove-image-btn small"
                      onClick={handleRemoveImage}
                    >
                      <FaTimes /> Remove
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* New Product Toggle */}
            <div className="form-group toggle-group">
              <label className="toggle-label">
                <span className="toggle-text">
                  {formData.isNew ? (
                    <>
                      <FaToggleOn className="toggle-icon active" /> Mark as New
                      Product
                    </>
                  ) : (
                    <>
                      <FaToggleOff className="toggle-icon" /> Mark as New
                      Product
                    </>
                  )}
                </span>
                <input
                  type="checkbox"
                  name="isNew"
                  checked={formData.isNew}
                  onChange={handleChange}
                  className="toggle-input"
                />
              </label>
              <small className="form-hint">
                {formData.isNew
                  ? "✅ This product will be shown as 'New' on the store"
                  : "Toggle to mark this product as new"}
              </small>
            </div>

            {/* Preview Card */}
            <div className="preview-card">
              <h4>📋 Product Preview</h4>
              <div className="preview-content">
                <div className="preview-row">
                  <span className="preview-label">Name</span>
                  <span className="preview-value">{formData.name || "—"}</span>
                </div>
                <div className="preview-row">
                  <span className="preview-label">Category</span>
                  <span className="preview-value">
                    {formData.category || "—"}
                  </span>
                </div>
                <div className="preview-row">
                  <span className="preview-label">Price</span>
                  <span className="preview-value">
                    {formData.price ? `₹${formData.price}` : "—"}
                    {formData.discountPrice && (
                      <span className="preview-discount">
                        ₹{formData.discountPrice}
                      </span>
                    )}
                  </span>
                </div>
                <div className="preview-row">
                  <span className="preview-label">Stock</span>
                  <span className="preview-value">{formData.stock || "—"}</span>
                </div>
                {formData.isNew && (
                  <div className="preview-badge">✨ New Product</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="form-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate("/admin/products")}
          >
            Cancel
          </button>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span> Adding Product...
              </>
            ) : (
              <>
                <FaSave /> Add Product
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddProduct;
