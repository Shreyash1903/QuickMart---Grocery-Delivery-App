import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {clearCart,getCart,removeItem,updateQuantity,CART_UPDATED_EVENT}from "../api/cart";
import { toast } from "react-toastify";
import "./cart.css";

const formatPrice = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState({ items: [], totalPrice: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingItem, setRemovingItem] = useState(null);
  const [updatingItem, setUpdatingItem] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const cartRef = useRef(null);

  const loadCart = async () => {
    try {
      setLoading(true);
      const data = await getCart();
      setCart({
        items: data.items || [],
        totalPrice: data.totalPrice || 0,
      });
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to load cart",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();

    const handleCartUpdate = () => {
      loadCart();
    };

    window.addEventListener(CART_UPDATED_EVENT, handleCartUpdate);

    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, handleCartUpdate);
    };
  }, []);

  const handleQuantityChange = async (productId, nextQuantity) => {
    if (nextQuantity < 1) return;

    try {
      setUpdatingItem(productId);
      await updateQuantity(productId, nextQuantity);
    } finally {
      setUpdatingItem(null);
    }
  };

  const handleRemove = async (productId) => {
    try {
      setRemovingItem(productId);
      await removeItem(productId);
      
      // ✅ Success Toast
      toast.info("🗑️ Item removed from cart", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      // ❌ Error Toast
      toast.error("❌ Failed to remove item", {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setRemovingItem(null);
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
      setShowClearConfirm(false);
      
      // ✅ Success Toast
      toast.warning("🗑️ Cart cleared successfully", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      // ❌ Error Toast
      toast.error("❌ Failed to clear cart", {
        position: "top-right",
        autoClose: 4000,
      });
    }
  };

  const totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);

  if (loading) {
    return (
      <div className="cart-page-shell">
        <div className="cart-loading">
          <div className="cart-loading-spinner"></div>
          <p>Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cart-page-shell">
        <div className="cart-error-state">
          <div className="error-icon">😕</div>
          <h3>Oops! Something went wrong</h3>
          <p>{error}</p>
          <button className="cart-retry-btn" onClick={loadCart}>
            <i className="bi bi-arrow-repeat"></i> Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!cart.items.length) {
    return (
      <div className="cart-page-shell">
        <div className="cart-empty-state">
          <div className="empty-cart-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added anything to your cart yet.</p>
          <p className="empty-subtext">Explore our products and start shopping!</p>
          <button
            className="cart-action-btn explore-btn"
            onClick={() => navigate("/products")}
          >
            <i className="bi bi-shop"></i> Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page-shell" ref={cartRef}>
      {/* ===== HEADER ===== */}
      <div className="cart-page-header">
        <div className="cart-header-left">
          <h1>
            <i className="bi bi-cart3"></i> Your Cart
          </h1>
          <span className="cart-item-count">{totalItems} items</span>
        </div>

        <div className="cart-header-actions">
          <button
            className="cart-secondary-btn"
            onClick={() => navigate("/address")}
          >
            <i className="bi bi-geo-alt"></i> Add Address
          </button>

          <button 
            className="cart-clear-btn" 
            onClick={() => setShowClearConfirm(true)}
          >
            <i className="bi bi-trash3"></i> Clear Cart
          </button>
        </div>
      </div>

      {/* ===== CLEAR CART CONFIRMATION ===== */}
      {showClearConfirm && (
        <div className="clear-confirm-overlay">
          <div className="clear-confirm-modal">
            <div className="clear-confirm-icon">⚠️</div>
            <h3>Clear Cart?</h3>
            <p>Are you sure you want to remove all items from your cart?</p>
            <div className="clear-confirm-actions">
              <button 
                className="clear-confirm-cancel"
                onClick={() => setShowClearConfirm(false)}
              >
                Cancel
              </button>
              <button 
                className="clear-confirm-proceed"
                onClick={handleClearCart}
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MAIN LAYOUT ===== */}
      <div className="cart-layout">
        <div className="cart-items-list">
          {cart.items.map((item, index) => {
            const product = item.product || {};
            const productId = product._id || item.product;
            const itemPrice = product.discountPrice > 0 ? product.discountPrice : product.price;
            const isUpdating = updatingItem === productId;
            const isRemoving = removingItem === productId;

            return (
              <div 
                key={productId} 
                className={`cart-item-card ${isRemoving ? 'removing' : ''}`}
                style={{ '--delay': `${index * 0.05}s` }}
              >
                <div className="cart-item-image-wrapper">
                  <img
                    className="cart-item-image"
                    src={product.image || 'https://via.placeholder.com/110x110/f0f0f0/666?text=Product'}
                    alt={product.name}
                    loading="lazy"
                  />
                </div>

                <div className="cart-item-info">
                  <div className="cart-item-header">
                    <h3>{product.name}</h3>
                    <span className="cart-item-category">{product.category}</span>
                  </div>

                  <div className="cart-item-price-row">
                    <span className="cart-item-price">
                      {formatPrice(itemPrice)}
                    </span>
                  </div>
                </div>

                <div className="cart-item-actions">
                  <div className="quantity-control">
                    <button
                      onClick={() => handleQuantityChange(productId, item.quantity - 1)}
                      disabled={isUpdating || isRemoving}
                      className={item.quantity <= 1 ? 'quantity-min' : ''}
                    >
                      <i className="bi bi-dash"></i>
                    </button>
                    <span className={isUpdating ? 'updating' : ''}>
                      {isUpdating ? <i className="bi bi-arrow-repeat spin"></i> : item.quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(productId, item.quantity + 1)}
                      disabled={isUpdating || isRemoving}
                    >
                      <i className="bi bi-plus"></i>
                    </button>
                  </div>

                  <button
                    className="cart-remove-btn"
                    onClick={() => handleRemove(productId)}
                    disabled={isRemoving}
                  >
                    {isRemoving ? (
                      <i className="bi bi-arrow-repeat spin"></i>
                    ) : (
                      <i className="bi bi-trash3"></i>
                    )}
                    {isRemoving ? 'Removing...' : 'Remove'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ===== SUMMARY CARD ===== */}
        <aside className="cart-summary-card">
          <h2>
            <i className="bi bi-receipt"></i> Price Details
          </h2>
          
          <div className="summary-row">
            <span>Total Items</span>
            <span>{totalItems}</span>
          </div>
          
          <div className="summary-row total-row">
            <span>Total Price</span>
            <span>{formatPrice(cart.totalPrice)}</span>
          </div>

          <button 
            className="checkout-btn"
            onClick={() => navigate("/checkout")}
          >
            <i className="bi bi-bag-check"></i> Proceed to Checkout
          </button>
          
          <p className="checkout-note">
            <i className="bi bi-shield-check"></i> Secure checkout
          </p>
        </aside>
      </div>
    </div>
  );
}

export default Cart;