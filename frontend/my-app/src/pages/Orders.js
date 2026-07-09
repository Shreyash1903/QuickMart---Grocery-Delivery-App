import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cancelOrder, getMyOrders } from "../api/orders";
import { toast } from "react-toastify";
import "./orders.css";

const formatPrice = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelConfirm, setCancelConfirm] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await getMyOrders();
      setOrders(data.orders || []);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to load orders",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleCancel = async (orderId) => {
    try {
      setCancelling(true);
      await cancelOrder(orderId);
      await loadOrders();
      setCancelConfirm(null);
      
      toast.success("❌ Order cancelled successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to cancel order";
      setError(errorMsg);
      toast.error(`❌ ${errorMsg}`, {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setCancelling(false);
    }
  };

  // ✅ Get Complete Address
  const getCompleteAddress = (address) => {
    if (!address) return "-";
    
    const parts = [];
    if (address.houseNo) parts.push(address.houseNo);
    if (address.area) parts.push(address.area);
    if (address.landmark) parts.push(`(${address.landmark})`);
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    if (address.pincode) parts.push(address.pincode);
    
    return parts.join(", ") || "-";
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch(status.toLowerCase()) {
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
    switch(status.toLowerCase()) {
      case 'placed': return 'status-placed';
      case 'accepted': return 'status-accepted';
      case 'packed': return 'status-packed';
      case 'out for delivery': return 'status-out-for-delivery';
      case 'delivered': return 'status-delivered';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-placed';
    }
  };

  if (loading) {
    return (
      <div className="orders-page-shell">
        <div className="orders-loading">
          <div className="orders-loading-spinner"></div>
          <p>Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page-shell">
      {/* ===== HEADER ===== */}
      <div className="orders-page-header">
        <div className="orders-header-left">
          <h1>
            <i className="bi bi-box-seam"></i> My Orders
          </h1>
          <span className="orders-count">{orders.length} orders</span>
        </div>

        <button
          className="orders-primary-btn checkout-btn"
          onClick={() => navigate("/checkout")}
        >
          <i className="bi bi-bag-check"></i> Checkout
        </button>
      </div>

      {/* ===== ERROR ===== */}
      {error && (
        <div className="orders-page-error">
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
                onClick={() => setCancelConfirm(null)}
                disabled={cancelling}
              >
                Cancel
              </button>
              <button 
                className="cancel-confirm-proceed"
                onClick={() => handleCancel(cancelConfirm)}
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

      {/* ===== EMPTY STATE ===== */}
      {!orders.length ? (
        <div className="orders-empty-state">
          <div className="empty-orders-icon">📋</div>
          <h2>No orders yet</h2>
          <p>Once you place an order, it will appear here.</p>
          <button
            className="orders-secondary-btn browse-btn"
            onClick={() => navigate("/products")}
          >
            <i className="bi bi-shop"></i> Start Shopping
          </button>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order, index) => (
            <article 
              key={order._id} 
              className="order-card"
              style={{ '--delay': `${index * 0.05}s` }}
            >
              {/* ===== ORDER HEADER ===== */}
              <div className="order-card-top">
                <div className="order-header-left">
                  <h2>
                    <span className="order-id">#{order._id.slice(-8).toUpperCase()}</span>
                  </h2>
                  <p className="order-date">
                    <i className="bi bi-clock"></i> {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                <span className={`status-pill ${getStatusColor(order.orderStatus)}`}>
                  <span className="status-icon">{getStatusIcon(order.orderStatus)}</span>
                  {order.orderStatus}
                </span>
              </div>

              {/* ===== ORDER META ===== */}
              <div className="order-meta-grid">
                <div className="meta-item">
                  <span className="meta-label">
                    <i className="bi bi-credit-card"></i> Payment
                  </span>
                  <p>{order.paymentMethod || "Cash on Delivery"}</p>
                </div>

                <div className="meta-item">
                  <span className="meta-label">
                    <i className="bi bi-cash"></i> Amount
                  </span>
                  <p className="meta-amount">{formatPrice(order.totalAmount)}</p>
                </div>

                {/* ✅ FIXED: Complete Address */}
                <div className="meta-item">
                  <span className="meta-label">
                    <i className="bi bi-geo-alt"></i> Address
                  </span>
                  <p className="meta-address">{getCompleteAddress(order.address)}</p>
                </div>
              </div>

              {/* ===== ORDER ITEMS ===== */}
              <div className="order-items-list">
                {order.items.map((item) => (
                  <div key={item.product} className="order-item-row">
                    <img 
                      src={item.image || 'https://via.placeholder.com/64x64/f0f0f0/666?text=Product'} 
                      alt={item.name} 
                    />
                    <div className="order-item-info">
                      <h3>{item.name}</h3>
                      <p>
                        <span className="item-qty">Qty {item.quantity}</span>
                        <span className="item-price">· {formatPrice(item.price)} each</span>
                      </p>
                    </div>
                    <div className="order-item-total">
                      <span className="item-total-label">Total</span>
                      <span className="item-total-price">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* ===== ORDER ACTIONS ===== */}
              <div className="order-actions">
                <button
                  className="orders-secondary-btn view-btn"
                  onClick={() => navigate(`/orders/${order._id}`)}
                >
                  <i className="bi bi-eye"></i> View Details
                </button>

                {order.orderStatus !== "Delivered" && order.orderStatus !== "Cancelled" && (
                  <button
                    className="orders-danger-btn cancel-btn"
                    onClick={() => setCancelConfirm(order._id)}
                    disabled={cancelling}
                  >
                    <i className="bi bi-x-circle"></i> Cancel Order
                  </button>
                )}

                {order.orderStatus === "Delivered" && (
                  <button
                    className="orders-success-btn reorder-btn"
                    onClick={() => navigate("/products")}
                  >
                    <i className="bi bi-arrow-repeat"></i> Reorder
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default Orders;