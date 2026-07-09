import React, { useEffect, useState } from "react";
import API from "../api/adminApi";
import {
  FaRupeeSign,
  FaShoppingCart,
  FaUsers,
  FaBoxOpen,
  FaArrowUp,
  FaArrowDown,
  FaChartLine,
  FaCalendarAlt,
  FaEye,
  FaStar,
} from "react-icons/fa";
import { toast } from "react-toastify";
import "./Analytics.css";

function Analytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(""); // ✅ Add this line
  const [analytics, setAnalytics] = useState({
    revenue: {
      total: 0,
      today: 0,
      week: 0,
      month: 0,
    },
    orders: {
      total: 0,
      today: 0,
      week: 0,
      month: 0,
      average: 0,
    },
    users: {
      total: 0,
      newToday: 0,
      newWeek: 0,
      newMonth: 0,
    },
    products: {
      total: 0,
      categories: 0,
      topProducts: [],
    },
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await API.get("/analytics");
      setAnalytics(res.data);
      setError(""); // ✅ Add this
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError("Failed to load analytics"); // ✅ Add this
      toast.error("❌ Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="loading-spinner"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="analytics-container">
      {/* ===== HEADER ===== */}
      <div className="analytics-header">
        <div className="analytics-header-left">
          <h1 className="analytics-title">
            <i className="bi bi-graph-up-arrow"></i> Analytics
          </h1>
          <span className="analytics-subtitle">Track your business performance</span>
        </div>
        <div className="analytics-header-right">
          <div className="date-filter">
            <FaCalendarAlt className="filter-icon" />
            <select className="filter-select">
              <option value="7">Last 7 Days</option>
              <option value="30" selected>Last 30 Days</option>
              <option value="90">Last 90 Days</option>
              <option value="365">Last Year</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="analytics-error">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      {/* ===== SUMMARY CARDS ===== */}
      <div className="analytics-summary">
        <div className="summary-card revenue">
          <div className="summary-icon" style={{ background: "linear-gradient(135deg, #f6d365, #fda085)" }}>
            <FaRupeeSign />
          </div>
          <div className="summary-info">
            <span className="summary-label">Total Revenue</span>
            <span className="summary-value">{formatCurrency(analytics.revenue.total)}</span>
            <span className="summary-growth up">
              <FaArrowUp /> +15.2%
            </span>
          </div>
        </div>

        <div className="summary-card orders">
          <div className="summary-icon" style={{ background: "linear-gradient(135deg, #4facfe, #00f2fe)" }}>
            <FaShoppingCart />
          </div>
          <div className="summary-info">
            <span className="summary-label">Total Orders</span>
            <span className="summary-value">{analytics.orders.total}</span>
            <span className="summary-growth up">
              <FaArrowUp /> +8.7%
            </span>
          </div>
        </div>

        <div className="summary-card users">
          <div className="summary-icon" style={{ background: "linear-gradient(135deg, #f093fb, #f5576c)" }}>
            <FaUsers />
          </div>
          <div className="summary-info">
            <span className="summary-label">Total Users</span>
            <span className="summary-value">{analytics.users.total}</span>
            <span className="summary-growth up">
              <FaArrowUp /> +12.3%
            </span>
          </div>
        </div>

        <div className="summary-card products">
          <div className="summary-icon" style={{ background: "linear-gradient(135deg, #43e97b, #38f9d7)" }}>
            <FaBoxOpen />
          </div>
          <div className="summary-info">
            <span className="summary-label">Total Products</span>
            <span className="summary-value">{analytics.products.total}</span>
            <span className="summary-growth up">
              <FaArrowUp /> +5.8%
            </span>
          </div>
        </div>
      </div>

      {/* ===== CHARTS ===== */}
      <div className="analytics-grid">
        <div className="analytics-card chart-card">
          <div className="card-header">
            <h3><FaChartLine /> Revenue Trend</h3>
            <span className="card-subtitle">Last 30 days</span>
          </div>
          <div className="chart-placeholder">
            <div className="chart-bars">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="chart-bar-wrapper">
                  <div 
                    className="chart-bar" 
                    style={{ 
                      height: `${20 + Math.random() * 60}%`,
                      animationDelay: `${i * 0.05}s`
                    }}
                  ></div>
                  <span className="chart-label">W{i+1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="analytics-card stats-card">
          <div className="card-header">
            <h3>📊 Quick Stats</h3>
          </div>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Avg Order Value</span>
              <span className="stat-value">{formatCurrency(analytics.orders.average)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">New Users (Today)</span>
              <span className="stat-value">{analytics.users.newToday}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">New Users (Week)</span>
              <span className="stat-value">{analytics.users.newWeek}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Categories</span>
              <span className="stat-value">{analytics.products.categories}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ===== TOP PRODUCTS ===== */}
      <div className="analytics-card top-products">
        <div className="card-header">
          <h3>🏆 Top Products</h3>
          <span className="card-subtitle">Most popular items</span>
        </div>
        <div className="top-products-list">
          {[
            { name: "Amul Milk", sales: 234, revenue: 6552 },
            { name: "Parle-G Biscuits", sales: 189, revenue: 2268 },
            { name: "Aashirvaad Atta", sales: 156, revenue: 49920 },
          ].map((product, index) => (
            <div key={index} className="product-item">
              <span className="product-rank">#{index + 1}</span>
              <span className="product-name">{product.name}</span>
              <div className="product-stats">
                <span className="product-sales">
                  <FaEye /> {product.sales} sales
                </span>
                <span className="product-revenue">
                  <FaRupeeSign /> {formatCurrency(product.revenue)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Analytics;