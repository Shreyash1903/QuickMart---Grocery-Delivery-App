import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/adminApi";
import {
  FaEye,
  FaTrash,
  FaSearch,
  FaClock,
  FaCheckCircle,
  FaTruck,
  FaBoxOpen,
  FaTimesCircle,
  FaBox,
  FaShoppingBag,
  FaRupeeSign,
  FaCalendarAlt,
  FaUser,
  FaTag,
  FaBoxes,
} from "react-icons/fa";
import { toast } from "react-toastify";
import "./Orders.css";

function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [totalOrders, setTotalOrders] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    averageOrderValue: 0,
  });

  // ===== FETCH ORDERS =====
  useEffect(() => {
    fetchOrders();
  }, [searchTerm, currentPage]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      params.append("page", currentPage);
      params.append("limit", 10);

      let endpoint;
      let response;

      if (searchTerm && searchTerm.trim()) {
        params.append("search", searchTerm.trim());
        endpoint = `/orders/search?${params.toString()}`;
        response = await API.get(endpoint);
      } else {
        endpoint = `/orders?${params.toString()}`;
        response = await API.get(endpoint);
      }

      setOrders(response.data.orders || []);
      setTotalOrders(response.data.totalOrders || 0);
      setTotalPages(response.data.totalPages || 1);
      setStats({
        totalRevenue: response.data.stats?.totalRevenue || 0,
        averageOrderValue: response.data.stats?.averageOrderValue || 0,
      });
      setError("");
      
    } catch (err) {
      console.error("❌ Error fetching orders:", err);
      setError(err.response?.data?.message || "Failed to load orders");
      toast.error("❌ Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;

    try {
      await API.delete(`/orders/${id}`);
      toast.success("🗑️ Order deleted successfully!");
      fetchOrders();
    } catch (err) {
      toast.error("❌ Failed to delete order");
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await API.put(`/orders/${id}/status`, { orderStatus: newStatus });
      toast.success(`✅ Order status updated to ${newStatus}!`);
      fetchOrders();
    } catch (err) {
      toast.error("❌ Failed to update order status");
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Placed": return <FaClock className="status-icon placed" />;
      case "Accepted": return <FaCheckCircle className="status-icon accepted" />;
      case "Packed": return <FaBoxOpen className="status-icon packed" />;
      case "Out for Delivery": return <FaTruck className="status-icon out-for-delivery" />;
      case "Delivered": return <FaCheckCircle className="status-icon delivered" />;
      case "Cancelled": return <FaTimesCircle className="status-icon cancelled" />;
      default: return <FaBox className="status-icon" />;
    }
  };

  const getStatusClass = (status) => {
    return `status-badge status-${status.toLowerCase().replace(/\s+/g, '-')}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (value) => {
    return `₹${Number(value || 0).toLocaleString("en-IN")}`;
  };

  if (loading && orders.length === 0) {
    return (
      <div className="orders-loading">
        <div className="loading-spinner"></div>
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="orders-container">
      {/* ===== HEADER ===== */}
      <div className="orders-header">
        <div className="orders-header-left">
          <h1 className="orders-title">
            <FaShoppingBag className="title-icon" />
            Orders
          </h1>
          <span className="orders-count">{totalOrders} orders</span>
        </div>
      </div>

      {error && <div className="orders-error">{error}</div>}

      {/* ===== STATS ===== */}
      <div className="orders-stats">
        <div className="stat-box">
          <div className="stat-icon-wrapper">
            <FaShoppingBag />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Orders</span>
            <span className="stat-value">{totalOrders}</span>
          </div>
        </div>
        <div className="stat-box">
          <div className="stat-icon-wrapper revenue">
            <FaRupeeSign />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Revenue</span>
            <span className="stat-value">{formatPrice(stats.totalRevenue)}</span>
          </div>
        </div>
        <div className="stat-box">
          <div className="stat-icon-wrapper average">
            <FaShoppingBag />
          </div>
          <div className="stat-info">
            <span className="stat-label">Average Order</span>
            <span className="stat-value">{formatPrice(stats.averageOrderValue)}</span>
          </div>
        </div>
      </div>

      {/* ===== SEARCH BOX ===== */}
      <div className="orders-search">
        <div className="search-box-wrapper">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by Customer Name..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
            {searchTerm && (
              <button className="clear-search" onClick={clearSearch}>
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ===== ORDER CARDS GRID ===== */}
      {orders.length === 0 ? (
        <div className="orders-empty">
          <div className="empty-icon">📦</div>
          <h3>No orders found</h3>
          <p>{searchTerm ? `No orders found for "${searchTerm}"` : "No orders available"}</p>
        </div>
      ) : (
        <>
          <div className="orders-grid">
            {orders.map((order) => (
              <div key={order._id} className="order-card">
                {/* ===== CARD HEADER ===== */}
                <div className="order-card-header">
                  <div className="order-card-id">
                    <span className="order-id-label">Order #</span>
                    <span className="order-id-value">{order._id.slice(-8).toUpperCase()}</span>
                  </div>
                  <span className={getStatusClass(order.orderStatus)}>
                    {getStatusIcon(order.orderStatus)}
                    {order.orderStatus}
                  </span>
                </div>

                {/* ===== CARD BODY ===== */}
                <div className="order-card-body">
                  <div className="order-card-customer">
                    <div className="customer-name-row">
                      <FaUser className="customer-icon" />
                      <span className="customer-name">
                        {order.address?.fullName || "Guest"}
                      </span>
                    </div>
                    <div className="customer-email-row">
                      <span className="customer-email">
                        {order.user?.email || order.address?.email || ""}
                      </span>
                    </div>
                  </div>

                  <div className="order-card-details">
                    <div className="order-card-info">
                      <FaRupeeSign className="info-icon" />
                      <span className="info-label">Amount :</span>
                      <span className="info-value amount">{formatPrice(order.totalAmount)}</span>
                    </div>
                    <div className="order-card-info">
                      <FaBoxes className="info-icon" />
                      <span className="info-label">Items :</span>
                      <span className="info-value">{order.items?.length || 0} items</span>
                    </div>
                    <div className="order-card-info">
                      <FaCalendarAlt className="info-icon" />
                      <span className="info-label">Date :</span>
                      <span className="info-value">{formatDate(order.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* ===== CARD FOOTER ===== */}
                <div className="order-card-footer">
                  <select
                    className="status-select"
                    value={order.orderStatus}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                  >
                    <option value="Placed">Placed</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Packed">Packed</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>

                  <div className="order-card-actions">
                    <button
                      className="action-btn view-btn"
                      onClick={() => navigate(`/admin/orders/${order._id}`)}
                      title="View Order"
                    >
                      <FaEye /> View
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDelete(order._id)}
                      title="Delete Order"
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ===== PAGINATION ===== */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="page-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </button>
              <span className="page-info">
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="page-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </button>
            </div>
          )}

          {/* ===== FOOTER ===== */}
          <div className="orders-footer">
            <span>Showing {orders.length} of {totalOrders} orders</span>
          </div>
        </>
      )}
    </div>
  );
}

export default Orders;