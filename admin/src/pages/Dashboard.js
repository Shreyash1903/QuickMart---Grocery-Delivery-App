import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/adminApi";
import {
  FaUsers,
  FaBoxOpen,
  FaShoppingCart,
  FaRupeeSign,
  FaArrowUp,
  FaArrowDown,
  FaPlus,
  FaEye,
  FaUserCog,
  FaChartLine,
  FaCalendarAlt,
  FaUserPlus,
  FaClock,
} from "react-icons/fa";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    fetchDashboard();
    fetchRecentUsers();
    setTimeout(() => setAnimate(true), 100);
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await API.get("/dashboard");
      const payload = res?.data || {};

      setStats({
        totalUsers: payload.totalUsers ?? 0,
        totalProducts: payload.totalProducts ?? 0,
        totalOrders: payload.totalOrders ?? 0,
        totalRevenue: payload.totalRevenue ?? 0,
      });
      setError("");
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      setError("Unable to load dashboard data right now.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch Recent Users
  const fetchRecentUsers = async () => {
    try {
      const res = await API.get("/users?limit=5&sort=createdAt");
      setRecentUsers(res.data.users || []);
    } catch (error) {
      console.error("Error fetching recent users:", error);
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

  // ✅ Format Time Ago
  const timeAgo = (date) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hr ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // ✅ Get Initials for Avatar
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // ✅ Get Random Color for Avatar
  const getAvatarColor = (name) => {
    const colors = ['#4f46e5', '#0c831f', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6', '#ef4444'];
    const index = name ? name.length % colors.length : 0;
    return colors[index];
  };

  const cardData = [
    {
      id: 1,
      title: "Total Users",
      value: stats.totalUsers,
      icon: FaUsers,
      color: "#4facfe",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      growth: "+12.5%",
      trend: "up",
      delay: "0s",
      bg: "rgba(102, 126, 234, 0.08)"
    },
    {
      id: 2,
      title: "Total Products",
      value: stats.totalProducts,
      icon: FaBoxOpen,
      color: "#43e97b",
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      growth: "+8.3%",
      trend: "up",
      delay: "0.1s",
      bg: "rgba(240, 147, 251, 0.08)"
    },
    {
      id: 3,
      title: "Total Orders",
      value: stats.totalOrders,
      icon: FaShoppingCart,
      color: "#fa709a",
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      growth: "+5.7%",
      trend: "up",
      delay: "0.2s",
      bg: "rgba(79, 172, 254, 0.08)"
    },
    {
      id: 4,
      title: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      icon: FaRupeeSign,
      color: "#f6d365",
      gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      growth: "+15.2%",
      trend: "up",
      delay: "0.3s",
      bg: "rgba(67, 233, 123, 0.08)"
    }
  ];

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loader">
          <div className="loader-ring"></div>
          <div className="loader-ring"></div>
          <div className="loader-ring"></div>
          <div className="loader-ring"></div>
        </div>
        <p className="loading-text">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* ===== BACKGROUND DECORATION ===== */}
      <div className="bg-decoration">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
        <div className="orb orb-4"></div>
      </div>

      {/* ===== HEADER ===== */}
      <div className="dashboard-header">
        <div className="header-left">
          <div className="greeting-badge">
            <span className="wave-emoji">👋</span>
            Welcome back, Admin !
          </div>
          <h1 className="dashboard-title">
            Dashboard <span className="title-dot">•</span> Overview
          </h1>
          <p className="dashboard-subtitle">
            Here's what's happening with your business today
          </p>
        </div>
        <div className="header-right">
          <div className="date-badge">
            <FaCalendarAlt className="date-icon" />
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>
      </div>

      {error && (
        <div className="dashboard-error">
          <span className="error-icon">⚠️</span>
          {error}
          <button className="retry-btn" onClick={fetchDashboard}>
            Retry
          </button>
        </div>
      )}

      {/* ===== STATS CARDS ===== */}
      <div className="dashboard-cards">
        {cardData.map((card) => {
          const Icon = card.icon;
          return (
            <div 
              key={card.id}
              className={`stat-card ${animate ? 'slide-in' : ''}`}
              style={{ '--delay': card.delay }}
            >
              <div className="card-glow" style={{ background: card.gradient }}></div>
              <div className="card-content">
                <div className="stat-header">
                  <div className="stat-icon-wrapper" style={{ background: card.gradient }}>
                    <Icon size={22} />
                  </div>
                  <div className={`trend-badge ${card.trend}`}>
                    {card.trend === 'up' ? <FaArrowUp /> : <FaArrowDown />}
                    {card.growth}
                  </div>
                </div>
                <div className="stat-info">
                  <h3 className="stat-value">
                    {typeof card.value === 'string' ? card.value : 
                      new Intl.NumberFormat().format(card.value)}
                  </h3>
                  <p className="stat-label">{card.title}</p>
                </div>
                <div className="stat-progress">
                  <div 
                    className="progress-bar" 
                    style={{ 
                      width: `${Math.min((typeof card.value === 'number' ? card.value : 100) / 1000 * 100, 100)}%`,
                      background: card.gradient 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ===== BOTTOM SECTION ===== */}
      <div className="dashboard-bottom">
        {/* ===== QUICK ACTIONS ===== */}
        <div className="quick-actions">
          <div className="section-header">
            <h3 className="section-title">
              <span className="section-icon">⚡</span>
              Quick Actions
            </h3>
            <span className="section-subtitle">Get things done faster</span>
          </div>
          <div className="actions-grid">
            <button className="action-btn add-product" onClick={() => navigate("/admin/add-product")}>
              <span className="btn-icon">➕</span>
              <span>Add Product</span>
            </button>
            <button className="action-btn view-orders" onClick={() => navigate("/admin/orders")}>
              <span className="btn-icon">📦</span>
              <span>View Orders</span>
            </button>
            <button className="action-btn manage-users" onClick={() => navigate("/admin/users")}>
              <span className="btn-icon">👥</span>
              <span>Manage Users</span>
            </button>
            <button className="action-btn generate-report" onClick={() => navigate("/admin/analytics")}>
              <span className="btn-icon">📊</span>
              <span>Analytics</span>
            </button>
          </div>
        </div>

        {/* ===== RECENT USERS ACTIVITY ===== */}
        <div className="recent-activity">
          <div className="section-header">
            <h3 className="section-title">
              <span className="section-icon">👤</span>
              Recent Users
            </h3>
            <span className="section-subtitle">Latest registered users</span>
          </div>
          <div className="activity-list">
            {recentUsers.length === 0 ? (
              <div className="activity-empty">
                <p>No users registered yet</p>
              </div>
            ) : (
              recentUsers.map((user) => (
                <div key={user._id} className="activity-item">
                  <div className="activity-avatar" style={{ background: getAvatarColor(user.name) }}>
                    {getInitials(user.name)}
                  </div>
                  <div className="activity-content">
                    <p className="activity-text">
                      <strong>{user.name}</strong> 
                      <span className="activity-email">{user.email}</span>
                    </p>
                    <span className="activity-time">
                      <FaClock className="time-icon" />
                      {timeAgo(user.createdAt)}
                    </span>
                  </div>
                  <div className="activity-status">
                    <span className={`status-dot ${user.isActive !== false ? 'active' : 'inactive'}`}></span>
                    <span className="status-text">{user.isActive !== false ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
              ))
            )}
            {recentUsers.length > 0 && (
              <div className="activity-view-all">
                <button onClick={() => navigate("/admin/users")}>
                  View All Users →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;