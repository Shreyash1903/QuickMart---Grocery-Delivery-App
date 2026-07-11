import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {addToCart,updateQuantity,removeItem,getCart,} from "../api/cart";
import {addToWishlist,removeFromWishlist,checkWishlist,} from "../api/wishlist";
import { toast } from "react-toastify";
import "./product.css";

function ProductCard({ product, initialWishlisted = false, onWishlistChange }) {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(0);
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Check if product is in cart on mount
  useEffect(() => {
    const checkCart = async () => {
      try {
        const cart = await getCart();
        const item = cart.items?.find(
          (item) =>
            item.product?._id === product._id || item.product === product._id,
        );
        if (item) {
          setQuantity(item.quantity);
        }
      } catch (error) {
        console.error("Error checking cart:", error);
      }
    };
    checkCart();
  }, [product._id]);

  // Check if product is in wishlist
  useEffect(() => {
    const checkWishlistStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const data = await checkWishlist(product._id);
        setIsWishlisted(data.isWishlisted || false);
      } catch (error) {
        console.error("Error checking wishlist:", error);
      }
    };

    if (!initialWishlisted) {
      checkWishlistStatus();
    }
  }, [product._id, initialWishlisted]);

  // ✅ Handle Wishlist Toggle with Event Dispatch
  const handleWishlistToggle = async (e) => {
    e.stopPropagation();

    const token = localStorage.getItem("token");
    if (!token) {
      toast.warning("Please login to add items to wishlist", {
        position: "top-right",
      });
      navigate("/login");
      return;
    }

    try {
      setWishlistLoading(true);

      if (isWishlisted) {
        // ✅ Remove from wishlist
        await removeFromWishlist(product._id);
        setIsWishlisted(false);
        toast.info("❤️ Removed from wishlist", {
          position: "top-right",
        });
        
        // ✅ Dispatch event to update navbar count
        window.dispatchEvent(new CustomEvent('wishlistUpdated', { 
          detail: { action: 'remove' } 
        }));
        
        if (onWishlistChange) {
          onWishlistChange(product, false);
        }
      } else {
        // ✅ Add to wishlist
        await addToWishlist(product._id);
        setIsWishlisted(true);
        toast.success("❤️ Added to wishlist!", {
          position: "top-right",
        });
        
        // ✅ Dispatch event to update navbar count
        window.dispatchEvent(new CustomEvent('wishlistUpdated', { 
          detail: { action: 'add' } 
        }));
        
        if (onWishlistChange) {
          onWishlistChange(product, true);
        }
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      const errorMessage = error.response?.data?.message || "";
      
      if (
        error.response?.status === 400 &&
        errorMessage.includes("already in wishlist")
      ) {
        setIsWishlisted(true);
        toast.info("❤️ Product is already in your wishlist", {
          position: "top-right",
        });
        return;
      }
      
      toast.error("❌ Failed to update wishlist", {
        position: "top-right",
      });
    } finally {
      setWishlistLoading(false);
    }
  };

  // Handle Add to Cart
  const handleAddToCart = async (e) => {
    e.stopPropagation();
    try {
      setAdding(true);
      await addToCart(product._id);
      setQuantity(1);
      toast.success(`🛒 ${product.name} added to cart!`, {
        position: "top-right",
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("❌ Failed to add product to cart", {
        position: "top-right",
      });
    } finally {
      setAdding(false);
    }
  };

  // Handle Quantity Increase
  const handleIncrease = async (e) => {
    e.stopPropagation();
    try {
      setLoading(true);
      const newQuantity = quantity + 1;
      await updateQuantity(product._id, newQuantity);
      setQuantity(newQuantity);
    } catch (error) {
      console.error("Error updating quantity:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle Quantity Decrease
  const handleDecrease = async (e) => {
    e.stopPropagation();
    try {
      setLoading(true);
      if (quantity <= 1) {
        await removeItem(product._id);
        setQuantity(0);
        toast.info("🗑️ Item removed from cart", {
          position: "top-right",
        });
      } else {
        const newQuantity = quantity - 1;
        await updateQuantity(product._id, newQuantity);
        setQuantity(newQuantity);
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
    } finally {
      setLoading(false);
    }
  };

  // Navigate to product details
  const handleCardClick = () => {
    navigate(`/products/${product._id}`);
  };

  // Format price
  const formatPrice = (value) =>
    `₹ ${Number(value || 0).toLocaleString("en-IN")}`;

  // Calculate discount
  const discountPercentage =
    product.discountPrice && product.price > product.discountPrice
      ? Math.round(
          ((product.price - product.discountPrice) / product.price) * 100,
        )
      : 0;

  // Check if product is in stock
  const inStock = product.stock !== undefined ? product.stock > 0 : true;

  // Get stock status text
  const getStockStatus = () => {
    if (product.stock === undefined) return null;
    if (product.stock > 20) return { text: "In Stock", color: "#0c831f" };
    if (product.stock > 5)
      return { text: `Only ${product.stock} left`, color: "#ffd93d" };
    if (product.stock > 0)
      return { text: `Only ${product.stock} left!`, color: "#ff6b6b" };
    return { text: "Out of Stock", color: "#ff6b6b" };
  };

  const stockStatus = getStockStatus();

  return (
    <div
      className="product-card"
      onClick={handleCardClick}
      style={{ cursor: "pointer" }}
    >
      {/* ===== WISHLIST BUTTON ===== */}
      <button
        className={`wishlist-btn ${isWishlisted ? "active" : ""}`}
        onClick={handleWishlistToggle}
        disabled={wishlistLoading}
        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        <i className={`bi ${isWishlisted ? "bi-heart-fill" : "bi-heart"}`}></i>
        {wishlistLoading && <span className="wishlist-spinner"></span>}
      </button>

      {/* ===== PRODUCT BADGES ===== */}
      <div className="product-badges">
        {discountPercentage > 0 && (
          <span className="badge discount-badge">
            {discountPercentage}% OFF
          </span>
        )}
        {product.isNew && <span className="badge new-badge">NEW</span>}
        {!inStock && (
          <span className="badge out-of-stock-badge">OUT OF STOCK</span>
        )}
      </div>

      {/* ===== PRODUCT IMAGE ===== */}
      <div className="product-image-wrapper">
        <img
          src={
            product.image ||
            "https://via.placeholder.com/300x300/f0f0f0/666?text=Product"
          }
          alt={product.name}
          loading="lazy"
        />
      </div>

      {/* ===== PRODUCT INFO ===== */}
      <div className="product-info">
        <div className="product-header">
          <h4 className="product-name">{product.name}</h4>
          <span className="product-category">{product.category}</span>
        </div>

        {/* Description */}
        {product.description && (
          <p className="product-description">{product.description}</p>
        )}

        {/* Quantity */}
        {product.quantity && (
          <p className="product-quantity">
            <i className="bi bi-box-seam"></i> {product.quantity}
          </p>
        )}

        {/* Stock Status */}
        {stockStatus && (
          <div className="product-stock">
            <span
              className="stock-dot"
              style={{ background: stockStatus.color }}
            ></span>
            <span className="stock-text" style={{ color: stockStatus.color }}>
              {stockStatus.text}
            </span>
          </div>
        )}

        {/* ===== PRICE & CART ACTIONS ===== */}
        <div className="price-box">
          <div className="price-group">
            <span className="discount-price">
              {formatPrice(product.discountPrice || product.price)}
            </span>
            {product.discountPrice > 0 &&
              product.discountPrice < product.price && (
                <span className="original-price">
                  {formatPrice(product.price)}
                </span>
              )}
          </div>

          {/* ===== ADD / + - BUTTONS ===== */}
          {quantity === 0 ? (
            <button
              className="add-to-cart-btn"
              onClick={handleAddToCart}
              disabled={adding || !inStock}
            >
              {adding ? (
                <>
                  <span className="spinner"></span> Adding...
                </>
              ) : (
                "ADD"
              )}
            </button>
          ) : (
            <div
              className="quantity-control"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="qty-btn qty-decrease"
                onClick={handleDecrease}
                disabled={loading}
              >
                <i className="bi bi-dash"></i>
              </button>
              <span className="qty-number">{quantity}</span>
              <button
                className="qty-btn qty-increase"
                onClick={handleIncrease}
                disabled={loading}
              >
                <i className="bi bi-plus"></i>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductCard;