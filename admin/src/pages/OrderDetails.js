import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrderById, updateOrderStatus } from "../api/ordersApi";
import {
  FaArrowLeft,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaRupeeSign,
  FaBox,
  FaClock,
  FaCheckCircle,
  FaTruck,
  FaBoxOpen,
  FaTimesCircle,
  FaPrint,
} from "react-icons/fa";
import { toast } from "react-toastify";
import "./OrderDetails.css";

function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await getOrderById(id);
      setOrder(res.order);
      setError("");
    } catch (err) {
      console.error("Error fetching order:", err);
      setError("Failed to load order details");
      toast.error("❌ Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdating(true);
      await updateOrderStatus(id, newStatus);
      toast.success(`✅ Order status updated to ${newStatus}!`);
      fetchOrder();
    } catch (err) {
      toast.error("❌ Failed to update order status");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Placed":
        return <FaClock className="status-icon placed" />;
      case "Accepted":
        return <FaCheckCircle className="status-icon accepted" />;
      case "Packed":
        return <FaBoxOpen className="status-icon packed" />;
      case "Out for Delivery":
        return <FaTruck className="status-icon out-for-delivery" />;
      case "Delivered":
        return <FaCheckCircle className="status-icon delivered" />;
      case "Cancelled":
        return <FaTimesCircle className="status-icon cancelled" />;
      default:
        return <FaBox className="status-icon" />;
    }
  };

  const getStatusClass = (status) => {
    return `status-badge status-${status.toLowerCase().replace(/\s+/g, "-")}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (value) => {
    return `₹ ${Number(value || 0).toLocaleString("en-IN")}`;
  };

  const statusOptions = [
    "Placed",
    "Accepted",
    "Packed",
    "Out for Delivery",
    "Delivered",
    "Cancelled",
  ];

  // ✅ RENDER ADDRESS - FIXED
  const renderAddress = () => {
    const addr = order.address;

    if (!addr) {
      return (
        <div className="address-empty">
          <p>No delivery address available</p>
          <small>Address not provided for this order</small>
        </div>
      );
    }

    return (
      <div className="address-details">
        <p className="address-name">
          <strong>{addr.fullName || "Guest"}</strong>
        </p>
        <p className="address-line">{addr.houseNo || ""}</p>
        <p className="address-line">{addr.area || ""}</p>
        {addr.landmark && (
          <p className="address-line">Landmark: {addr.landmark}</p>
        )}
        <p className="address-line">
          {addr.city || ""}, {addr.state || ""}
        </p>
        <p className="address-pincode">Pin Code: {addr.pincode || ""}</p>
        <p className="address-phone">📞 {addr.mobileNumber || "N/A"}</p>
        {addr.addressType && (
          <p className="address-type">🏷️ {addr.addressType}</p>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="order-details-loading">
        <div className="loading-spinner"></div>
        <p>Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="order-details-error-state">
        <div className="error-icon">😕</div>
        <h3>Order not found</h3>
        <p>The order you're looking for doesn't exist.</p>
        <button className="back-btn" onClick={() => navigate("/admin/orders")}>
          <FaArrowLeft /> Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="order-details-container">
      {/* ===== HEADER ===== */}
      <div className="order-details-header">
        <button className="back-btn" onClick={() => navigate("/admin/orders")}>
          <FaArrowLeft /> Back to Orders
        </button>
        <div className="header-center">
          <h1 className="page-title">
            Order #{order._id.slice(-8).toUpperCase()}
          </h1>
          <span className="order-date">
            Placed on {formatDate(order.createdAt)}
          </span>
        </div>
        <button className="print-btn" onClick={() => window.print()}>
          <FaPrint /> Print
        </button>
      </div>

      {error && <div className="order-details-error">{error}</div>}

      {/* ===== MAIN CONTENT ===== */}
      <div className="order-details-content">
        {/* ===== LEFT COLUMN ===== */}
        <div className="order-details-left">
          {/* ===== STATUS SECTION ===== */}
          <div className="detail-card status-card">
            <div className="card-header">
              <h3>Order Status</h3>
              <div className="status-wrapper">
                <span className={getStatusClass(order.orderStatus)}>
                  {getStatusIcon(order.orderStatus)}
                  {order.orderStatus}
                </span>
              </div>
            </div>
            <div className="status-update">
              <label>Update Status</label>
              <select
                value={order.orderStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={updating}
                className="status-select"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              {updating && <span className="updating-text">Updating...</span>}
            </div>

            {/* Status Timeline */}
            <div className="status-timeline">
              <div
                className={`timeline-item ${order.orderStatus === "Placed" || true ? "active" : ""}`}
              >
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <span className="timeline-title">Order Placed</span>
                  <span className="timeline-date">
                    {formatDate(order.createdAt)}
                  </span>
                </div>
              </div>
              <div
                className={`timeline-item ${["Accepted", "Packed", "Out for Delivery", "Delivered"].includes(order.orderStatus) ? "active" : ""}`}
              >
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <span className="timeline-title">Order Accepted</span>
                </div>
              </div>
              <div
                className={`timeline-item ${["Packed", "Out for Delivery", "Delivered"].includes(order.orderStatus) ? "active" : ""}`}
              >
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <span className="timeline-title">Order Packed</span>
                </div>
              </div>
              <div
                className={`timeline-item ${["Out for Delivery", "Delivered"].includes(order.orderStatus) ? "active" : ""}`}
              >
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <span className="timeline-title">Out for Delivery</span>
                </div>
              </div>
              <div
                className={`timeline-item ${order.orderStatus === "Delivered" ? "active" : ""}`}
              >
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <span className="timeline-title">Delivered</span>
                </div>
              </div>
            </div>
          </div>

          {/* ===== ORDER ITEMS ===== */}
          <div className="detail-card items-card">
            <div className="card-header">
              <h3>
                <FaBox /> Order Items
              </h3>
              <span className="items-count">
                {order.items?.length || 0} items
              </span>
            </div>
            <div className="items-list">
              {order.items?.map((item, index) => {
                const product = item.product || {};
                return (
                  <div key={index} className="item-row">
                    <div className="item-image">
                      {product.image ? (
                        <img src={product.image} alt={product.name} />
                      ) : (
                        <div className="no-image">📦</div>
                      )}
                    </div>
                    <div className="item-info">
                      <span className="item-name">
                        {product.name || item.name}
                      </span>
                      <span className="item-meta">
                        Qty : {item.quantity} × {formatPrice(item.price)}
                      </span>
                    </div>
                    <div className="item-total">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="order-summary">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ===== RIGHT COLUMN ===== */}
        <div className="order-details-right">
          {/* ===== PAYMENT INFO ===== */}
          <div className="detail-card">
            <div className="card-header">
              <h3>
                <FaRupeeSign /> Payment Details
              </h3>
            </div>
            <div className="info-list">
              <div className="info-item">
                <span className="info-label">Payment Method</span>
                <span className="info-value">
                  {order.paymentMethod || "N/A"}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Total Amount</span>
                <span className="info-value highlight">
                  {formatPrice(order.totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* ===== CUSTOMER INFO ===== */}
          <div className="detail-card">
            <div className="card-header">
              <h3>
                <FaUser /> Customer Details
              </h3>
            </div>
            <div className="info-list">
              <div className="info-item">
                <span className="info-label">
                  <FaUser /> Name
                </span>
                <span className="info-value">
                  {order.address?.fullName || "Guest"}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">
                  <FaEnvelope /> Email
                </span>
                <span className="info-value">
                  {order.user?.email || order.address?.email || "N/A"}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">
                  <FaPhone /> Phone
                </span>
                <span className="info-value">
                  {order.address?.mobileNumber || "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* ===== DELIVERY ADDRESS - FIXED ===== */}
          <div className="detail-card">
            <div className="card-header">
              <h3>
                <FaMapMarkerAlt /> Delivery Address
              </h3>
            </div>
            {renderAddress()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetails;
