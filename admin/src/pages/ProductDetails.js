import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById, deleteProduct } from "../api/productsApi";
import { FaArrowLeft, FaEdit, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import "./ProductDetails.css";

function AdminProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await getProductById(id);
        setProduct(res.product || res);
        setError("");
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to load product");
        toast.error("❌ Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    try {
      await deleteProduct(id);
      toast.success("🗑️ Product deleted successfully!");
      navigate("/admin/products");
    } catch (err) {
      toast.error("❌ Failed to delete product");
    }
  };

  const formatPrice = (value) =>
    `₹ ${Number(value || 0).toLocaleString("en-IN")}`;

  if (loading) {
    return (
      <div className="admin-product-details-loading">
        <div className="loading-spinner"></div>
        <p>Loading product...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="admin-product-details-error">
        <h3>Product not found</h3>
        <button onClick={() => navigate("/admin/products")}>
          <FaArrowLeft /> Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="admin-product-details-container">
      {/* ===== HEADER ===== */}
      <div className="admin-product-details-header">
        <button
          className="back-btn"
          onClick={() => navigate("/admin/products")}
        >
          <FaArrowLeft /> Back
        </button>
        <h1 className="page-title">Product Details</h1>
        <div className="header-actions">
          <button
            className="edit-btn"
            onClick={() => navigate(`/admin/edit-product/${product._id}`)}
          >
            <FaEdit /> Edit
          </button>
          <button className="delete-btn" onClick={handleDelete}>
            <FaTrash /> Delete
          </button>
        </div>
      </div>

      {/* ===== PRODUCT INFO ===== */}
      <div className="admin-product-details-card">
        <div className="product-details-grid">
          {/* Left - Image */}
          <div className="product-details-image">
            {product.image ? (
              <img src={product.image} alt={product.name} />
            ) : (
              <div className="no-image">No Image</div>
            )}
          </div>

          {/* Right - Info */}
          <div className="product-details-info">
            <div className="info-row">
              <span className="label">Product ID</span>
              <span className="value">{product._id}</span>
            </div>
            <div className="info-row">
              <span className="label">Name</span>
              <span className="value name">{product.name}</span>
            </div>
            <div className="info-row">
              <span className="label">Category</span>
              <span className="value category">{product.category}</span>
            </div>
            <div className="info-row">
              <span className="label">Price</span>
              <span className="value">{formatPrice(product.price)}</span>
            </div>
            {product.discountPrice && product.discountPrice < product.price && (
              <div className="info-row">
                <span className="label">Discount Price</span>
                <span className="value discount">
                  {formatPrice(product.discountPrice)}
                </span>
              </div>
            )}
            <div className="info-row">
              <span className="label">Quantity</span>
              <span className="value">{product.quantity || "-"}</span>
            </div>
            <div className="info-row">
              <span className="label">Stock</span>
              <span
                className={`value stock ${product.stock > 0 ? "in-stock" : "out-of-stock"}`}
              >
                {product.stock > 0
                  ? `${product.stock} in stock`
                  : "Out of stock"}
              </span>
            </div>
            <div className="info-row">
              <span className="label">Status</span>
              <span className={`value ${product.isNew ? "new" : ""}`}>
                {product.isNew ? "🆕 New" : "Regular"}
              </span>
            </div>
            {product.description && (
              <div className="info-row description">
                <span className="label">Description</span>
                <span className="value">{product.description}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminProductDetails;
