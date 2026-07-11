import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { cancelOrder, getOrderById } from "../api/orders";
import { toast } from "react-toastify";
import "./orderDetails.css";

const formatPrice = (value) => `₹ ${Number(value || 0).toLocaleString("en-IN")}`;

function OrderDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const data = await getOrderById(id);
      setOrder(data.order || null);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to load order",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [id]);

  const handleCancel = async () => {
    try {
      setCancelling(true);
      await cancelOrder(id);
      await loadOrder();
      setCancelConfirm(false);
      
      // ✅ Success Toast
      toast.success("❌ Order cancelled successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to cancel order";
      setError(errorMsg);
      
      // ❌ Error Toast
      toast.error(`❌ ${errorMsg}`, {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setCancelling(false);
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch(status?.toLowerCase()) {
      case 'placed': return '📦';
      case 'accepted': return '✅';
      case 'packed': return '📦';
      case 'out for delivery': return '🚚';
      case 'delivered': return '🎉';
      case 'cancelled': return '❌';
      default: return '📋';
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'placed': return 'status-placed';
      case 'accepted': return 'status-accepted';
      case 'packed': return 'status-packed';
      case 'out for delivery': return 'status-out-for-delivery';
      case 'delivered': return 'status-delivered';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-placed';
    }
  };

  // Get address type icon
  const getAddressIcon = (type) => {
    switch(type) {
      case 'Home': return '🏠';
      case 'Work': return '💼';
      case 'Other': return '📍';
      default: return '📍';
    }
  };

  if (loading) {
    return (
      <div className="order-details-shell">
        <div className="order-details-loading">
          <div className="order-details-loading-spinner"></div>
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-details-shell">
        <div className="order-details-empty">
          <div className="empty-icon">📋</div>
          <h2>Order not found</h2>
          <p>The order you're looking for doesn't exist or has been removed.</p>
          <button
            className="order-details-secondary-btn back-btn"
            onClick={() => navigate("/orders")}
          >
            <i className="bi bi-arrow-left"></i> Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="order-details-shell">
      {/* ===== HEADER ===== */}
      <div className="order-details-header">
        <div className="order-details-header-left">
          <h1>
            <i className="bi bi-box-seam"></i> Order Details
          </h1>
          <span className="order-id-badge">#{order._id.slice(-8).toUpperCase()}</span>
        </div>

        <button
          className="order-details-secondary-btn back-btn"
          onClick={() => navigate("/orders")}
        >
          <i className="bi bi-arrow-left"></i> Back to Orders
        </button>
      </div>

      {/* ===== ERROR ===== */}
      {error && (
        <div className="order-details-error">
          <i className="bi bi-exclamation-circle"></i> {error}
        </div>
      )}

      {/* ===== CANCEL CONFIRMATION MODAL ===== */}
      {cancelConfirm && (
        <div className="cancel-confirm-overlay">
          <div className="cancel-confirm-modal">
            <div className="cancel-confirm-icon">⚠️</div>
            <h3>Cancel Order?</h3>
            <p>Are you sure you want to cancel this order? This action cannot be undone.</p>
            <div className="cancel-confirm-actions">
              <button 
                className="cancel-confirm-cancel"
                onClick={() => setCancelConfirm(false)}
                disabled={cancelling}
              >
                Cancel
              </button>
              <button 
                className="cancel-confirm-proceed"
                onClick={handleCancel}
                disabled={cancelling}
              >
                {cancelling ? (
                  <>
                    <span className="btn-spinner"></span> Cancelling...
                  </>
                ) : (
                  'Yes, Cancel Order'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MAIN LAYOUT ===== */}
      <div className="order-details-layout">
        {/* ===== LEFT COLUMN ===== */}
        <section className="order-details-card main-card">
          {/* ===== STATUS & META ===== */}
          <div className="order-status-section">
            <div className="order-status-header">
              <span className={`status-pill ${getStatusColor(order.orderStatus)}`}>
                <span className="status-icon">{getStatusIcon(order.orderStatus)}</span>
                {order.orderStatus}
              </span>
              <span className="order-date-large">
                <i className="bi bi-clock"></i> {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>

            <div className="order-details-meta">
              <div className="meta-item">
                <span className="meta-label">
                  <i className="bi bi-credit-card"></i> Payment Method
                </span>
                <p>{order.paymentMethod}</p>
              </div>
              <div className="meta-item">
                <span className="meta-label">
                  <i className="bi bi-cash"></i> Total Amount
                </span>
                <p className="meta-amount">{formatPrice(order.totalAmount)}</p>
              </div>
              <div className="meta-item">
                <span className="meta-label">
                  <i className="bi bi-box"></i> Items
                </span>
                <p>{order.items?.length || 0} products</p>
              </div>
            </div>
          </div>

          {/* ===== ITEMS LIST ===== */}
          <div className="order-items-section">
            <h2>
              <i className="bi bi-list-ul"></i> Order Items
            </h2>
            <div className="order-details-items-grid">
              {order.items.map((item) => (
                <div key={item.product} className="order-details-item-card">
                  <img 
                    src={item.image || 'https://via.placeholder.com/64x64/f0f0f0/666?text=Product'} 
                    alt={item.name} 
                    className="item-card-img"
                  />
                  <div className="item-card-details">
                    <h3 className="item-card-name">{item.name}</h3>
                    <div className="item-card-meta">
                      <span className="item-card-qty">Qty {item.quantity}</span>
                      <span className="item-card-price">{formatPrice(item.price)} each</span>
                    </div>
                    <div className="item-card-subtotal">
                      <span className="subtotal-label">Subtotal</span>
                      <span className="subtotal-amount">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ===== ORDER SUMMARY ===== */}
            <div className="order-summary">
              <div className="summary-row">
                <span>Subtotal ({order.items?.length || 0} items)</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
              <div className="summary-row total-row">
                <span>Total Amount</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        </section>

        {/* ===== RIGHT COLUMN ===== */}
        <aside className="order-details-card side-card">
          {/* ===== ADDRESS SECTION ===== */}
          <div className="address-section">
            <h2>
              <i className="bi bi-geo-alt"></i> Delivery Address
            </h2>
            <div className="order-details-address">
              <div className="address-name">
                <span className="address-icon">{getAddressIcon(order.address?.addressType)}</span>
                <strong>{order.address?.fullName}</strong>
              </div>
              <p className="address-mobile">
                <i className="bi bi-phone"></i> {order.address?.mobileNumber}
              </p>
              <p className="address-detail">
                {order.address?.houseNo}, {order.address?.area}
              </p>
              {order.address?.landmark && (
                <p className="address-landmark">
                  <i className="bi bi-pin-map"></i> {order.address?.landmark}
                </p>
              )}
              <p className="address-city">
                {order.address?.city}, {order.address?.state} - {order.address?.pincode}
              </p>
              <span className="address-type-tag">{order.address?.addressType || 'Home'}</span>
            </div>
          </div>

          {/* ===== ACTION BUTTONS ===== */}
          <div className="action-buttons">
            {order.orderStatus !== "Delivered" && order.orderStatus !== "Cancelled" && (
              <button
                className="order-details-danger-btn cancel-btn"
                onClick={() => setCancelConfirm(true)}
                disabled={cancelling}
              >
                <i className="bi bi-x-circle"></i> Cancel Order
              </button>
            )}

            {order.orderStatus === "Delivered" && (
              <button
                className="order-details-success-btn reorder-btn"
                onClick={() => navigate("/products")}
              >
                <i className="bi bi-arrow-repeat"></i> Reorder
              </button>
            )}

            <button
              className="order-details-secondary-btn support-btn"
              onClick={() => navigate("/support")}
            >
              <i className="bi bi-headset"></i> Need Help?
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default OrderDetails;