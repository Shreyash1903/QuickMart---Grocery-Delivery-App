// pages/UserDetails.js

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserById } from "../api/usersApi";
import { getAllOrders } from "../api/ordersApi";
import {
  FaArrowLeft,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaCalendarAlt,
  FaUserTag,
  FaCheckCircle,
  FaTimesCircle,
  FaEdit,
  FaShoppingBag,
  FaBox,
  FaRupeeSign,
  FaClock,
} from "react-icons/fa";
import { toast } from "react-toastify";
import "./UserDetails.css";

function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUserDetails();
    fetchUserOrders();
  }, [id]);

  // ✅ Fetch User Details
  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const res = await getUserById(id);
      setUser(res.user);
      setError("");
    } catch (err) {
      console.error("Error fetching user:", err);
      setError("Failed to load user details");
      toast.error("❌ Failed to load user details");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch User Orders - NEW
  const fetchUserOrders = async () => {
    try {
      setOrdersLoading(true);
      const res = await getAllOrders({ userId: id, page: 1, limit: 10 });
      setOrders(res.orders || []);
    } catch (err) {
      console.error("Error fetching user orders:", err);
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (value) => {
    return `₹${Number(value || 0).toLocaleString("en-IN")}`;
  };

  const getStatusClass = (status) => {
    return `status-badge status-${status?.toLowerCase().replace(/\s+/g, "-") || "unknown"}`;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Placed":
        return <FaClock className="status-icon" />;
      case "Accepted":
        return <FaCheckCircle className="status-icon" />;
      case "Packed":
        return <FaBox className="status-icon" />;
      case "Out for Delivery":
        return <FaClock className="status-icon" />;
      case "Delivered":
        return <FaCheckCircle className="status-icon" />;
      case "Cancelled":
        return <FaTimesCircle className="status-icon" />;
      default:
        return <FaBox className="status-icon" />;
    }
  };

  if (loading) {
    return (
      <div className="user-details-loading">
        <div className="loading-spinner"></div>
        <p>Loading user details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-details-error">
        <p>{error}</p>
        <button onClick={() => navigate("/admin/users")} className="back-btn">
          <FaArrowLeft /> Back to Users
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="user-details-not-found">
        <h2>User not found</h2>
        <button onClick={() => navigate("/admin/users")} className="back-btn">
          <FaArrowLeft /> Back to Users
        </button>
      </div>
    );
  }

  return (
    <div className="user-details-container">
      {/* ===== HEADER ===== */}
      <div className="user-details-header">
        <button onClick={() => navigate("/admin/users")} className="back-btn">
          <FaArrowLeft /> Back to Users
        </button>
        <h1 className="user-details-title">User Details</h1>
        <button
          className="edit-user-btn"
          onClick={() => navigate(`/admin/edit-user/${user._id}`)}
        >
          <FaEdit /> Edit User
        </button>
      </div>

      {/* ===== USER CARD ===== */}
      <div className="user-details-card">
        <div className="user-avatar">
          {user.name ? user.name.charAt(0).toUpperCase() : "U"}
        </div>
        <div className="user-info">
          <h2 className="user-name">{user.name || "N/A"}</h2>
          <span
            className={`user-status ${user.isActive !== false ? "active" : "inactive"}`}
          >
            {user.isActive !== false ? <FaCheckCircle /> : <FaTimesCircle />}
            {user.isActive !== false ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      {/* ===== DETAILS GRID ===== */}
      <div className="user-details-grid">
        <div className="detail-item">
          <div className="detail-icon">
            <FaUser />
          </div>
          <div className="detail-content">
            <span className="detail-label">Full Name</span>
            <span className="detail-value">{user.name || "N/A"}</span>
          </div>
        </div>

        <div className="detail-item">
          <div className="detail-icon">
            <FaEnvelope />
          </div>
          <div className="detail-content">
            <span className="detail-label">Email</span>
            <span className="detail-value">{user.email || "N/A"}</span>
          </div>
        </div>

        <div className="detail-item">
          <div className="detail-icon">
            <FaPhone />
          </div>
          <div className="detail-content">
            <span className="detail-label">Phone</span>
            <span className="detail-value">{user.phone || "N/A"}</span>
          </div>
        </div>

        <div className="detail-item">
          <div className="detail-icon">
            <FaUserTag />
          </div>
          <div className="detail-content">
            <span className="detail-label">Role</span>
            <span className={`detail-value role-badge ${user.role}`}>
              {user.role || "user"}
            </span>
          </div>
        </div>

        <div className="detail-item">
          <div className="detail-icon">
            <FaCalendarAlt />
          </div>
          <div className="detail-content">
            <span className="detail-label">Joined On</span>
            <span className="detail-value">{formatDate(user.createdAt)}</span>
          </div>
        </div>

        <div className="detail-item">
          <div className="detail-icon">
            {user.isActive !== false ? (
              <FaCheckCircle className="active-icon" />
            ) : (
              <FaTimesCircle className="inactive-icon" />
            )}
          </div>
          <div className="detail-content">
            <span className="detail-label">Status</span>
            <span
              className={`detail-value status-text ${user.isActive !== false ? "active" : "inactive"}`}
            >
              {user.isActive !== false ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      </div>

      {/* ===== ORDERS SECTION - FIXED ===== */}
      <div className="user-orders-section">
        <div className="orders-header">
          <h3>
            <FaShoppingBag /> Order History
          </h3>
          <span className="orders-count">{orders.length} orders</span>
        </div>

        {ordersLoading ? (
          <div className="orders-loading-state">
            <div className="small-spinner"></div>
            <p>Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="no-orders">
            <div className="no-orders-icon">📦</div>
            <p>No orders found for this user</p>
            <small>This user hasn't placed any orders yet</small>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order._id} className="order-item">
                <div className="order-item-header">
                  <span className="order-id">
                    Order #{order._id.slice(-8).toUpperCase()}
                  </span>
                  <span className={getStatusClass(order.orderStatus)}>
                    {getStatusIcon(order.orderStatus)}
                    {order.orderStatus}
                  </span>
                </div>
                <div className="order-item-details">
                  <span className="order-date">
                    <FaCalendarAlt /> {formatDate(order.createdAt)}
                  </span>
                  <span className="order-items-count">
                    <FaBox /> {order.items?.length || 0} items
                  </span>
                  <span className="order-total">
                    <FaRupeeSign /> {formatPrice(order.totalAmount)}
                  </span>
                </div>
                <button
                  className="view-order-btn"
                  onClick={() => navigate(`/admin/orders/${order._id}`)}
                >
                  View Order →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserDetails;
