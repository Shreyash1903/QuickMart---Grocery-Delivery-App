import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api/adminApi";
import { toast } from "react-toastify";
import { 
  FaArrowLeft, 
  FaSave, 
  FaImage, 
  FaTrash, 
  FaBox,
  FaTag,
  FaRupeeSign,
  FaPercentage,
  FaClipboardList,
  FaToggleOn,
  FaToggleOff,
  FaHashtag
} from "react-icons/fa";
import "./EditProduct.css";

function EditProduct() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    discountPrice: "",
    quantity: "",
    description: "",
    stock: "",
    image: "",
    isNew: false,
  });

  // ===== FETCH PRODUCT DETAILS =====
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/products/${id}`);
        const product = res.data.product || res.data;

        setFormData({
          name: product.name || "",
          category: product.category || "",
          price: product.price || "",
          discountPrice: product.discountPrice || "",
          quantity: product.quantity || "",
          description: product.description || "",
          stock: product.stock || "",
          image: product.image || "",
          isNew: product.isNew || false,
        });
      } catch (err) {
        console.error("Error fetching product:", err);
        toast.error("❌ Failed to load product details", {
          position: "top-right",
        });
        navigate("/admin/products");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, navigate]);

  // ===== HANDLE CHANGE =====
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ===== HANDLE SUBMIT =====
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (!formData.category || formData.category.trim() === "") {
        toast.error("❌ Please enter a category");
        setSubmitting(false);
        return;
      }

      await API.put(`/products/${id}`, {
        name: formData.name,
        category: formData.category.trim(),
        price: Number(formData.price),
        discountPrice: Number(formData.discountPrice) || 0,
        quantity: formData.quantity,
        description: formData.description,
        stock: Number(formData.stock) || 0,
        image: formData.image,
        isNew: formData.isNew,
      });

      toast.success("✅ Product updated successfully!", {
        position: "top-right",
      });

      navigate("/admin/products");
    } catch (err) {
      console.error("Error updating product:", err);
      toast.error("❌ Failed to update product", {
        position: "top-right",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ===== HANDLE DELETE =====
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      await API.delete(`/products/${id}`);
      toast.success("🗑️ Product deleted successfully!", {
        position: "top-right",
      });
      navigate("/admin/products");
    } catch (err) {
      toast.error("❌ Failed to delete product", {
        position: "top-right",
      });
    }
  };

  if (loading) {
    return (
      <div className="edit-product-loading">
        <div className="loading-spinner"></div>
        <p>Loading product details...</p>
      </div>
    );
  }

  return (
    <div className="edit-product-container">
      {/* ===== HEADER ===== */}
      <div className="edit-product-header">
        <button className="back-btn" onClick={() => navigate("/admin/products")}>
          <FaArrowLeft /> Back to Products
        </button>
        <h1 className="edit-product-title">
          <span className="title-icon">✏️</span>
          Edit Product
        </h1>
        <button className="delete-btn" onClick={handleDelete}>
          <FaTrash /> Delete Product
        </button>
      </div>

      {/* ===== FORM ===== */}
      <form className="edit-product-form" onSubmit={handleSubmit}>
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
            {/* Image URL */}
            <div className="form-group image-group">
              <label>
                <FaImage className="input-icon" />
                Image URL
              </label>
              <input
                type="text"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                className="form-input"
              />
              <div className="image-preview-container">
                <div className="image-preview">
                  {formData.image ? (
                    <img src={formData.image} alt="Product preview" />
                  ) : (
                    <div className="image-placeholder">
                      <FaImage size={48} />
                      <span>No image uploaded</span>
                      <small>Add image URL above</small>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* New Product Toggle */}
            <div className="form-group toggle-group">
              <label className="toggle-label">
                <span className="toggle-text">
                  {formData.isNew ? (
                    <><FaToggleOn className="toggle-icon active" /> Mark as New Product</>
                  ) : (
                    <><FaToggleOff className="toggle-icon" /> Mark as New Product</>
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

            {/* Product Preview Card */}
            <div className="preview-card">
              <h4>📋 Product Preview</h4>
              <div className="preview-content">
                <div className="preview-row">
                  <span className="preview-label">Name</span>
                  <span className="preview-value">{formData.name || "—"}</span>
                </div>
                <div className="preview-row">
                  <span className="preview-label">Category</span>
                  <span className="preview-value">{formData.category || "—"}</span>
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

            {/* Product ID */}
            <div className="form-group product-id-group">
              <label>
                <FaHashtag className="input-icon" />
                Product ID
              </label>
              <div className="product-id-display">
                <span className="id-label">ID:</span>
                <span className="id-value">{id}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ===== SUBMIT BUTTONS ===== */}
        <div className="form-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate("/admin/products")}
          >
            Cancel
          </button>
          <button type="submit" className="submit-btn" disabled={submitting}>
            {submitting ? (
              <>
                <span className="spinner"></span> Updating Product...
              </>
            ) : (
              <>
                <FaSave /> Update Product
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditProduct;