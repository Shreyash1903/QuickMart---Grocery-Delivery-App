import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaChartPie,
  FaBoxOpen,
  FaPlusCircle,
  FaShoppingCart,
  FaUsers,
  FaChartLine,
  FaSignOutAlt,
  FaBars,
} from "react-icons/fa";
import "./Sidebar.css";

function Sidebar({ isOpen, toggleSidebar }) {
  const navigate = useNavigate();

  // ✅ Close sidebar when any link is clicked
  const handleLinkClick = () => {
    if (isOpen) {
      toggleSidebar();
    }
  };

  const handleLogout = () => {
    // ✅ Clear only the admin session token
    localStorage.removeItem("adminToken");
    
    // ✅ Close sidebar
    if (isOpen) toggleSidebar();
    
    // ✅ Redirect to admin login
    navigate("/login");
  };

  return (
    <>
      {/* Hamburger Icon - Always visible on mobile */}
      <button 
        className={`hamburger-btn ${isOpen ? "active" : ""}`} 
        onClick={toggleSidebar}
        aria-label="Toggle menu"
      >
        <FaBars />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand">
          <span className="sidebar-brand-icon">🛒</span>
          <span className="sidebar-brand-text">
            Quick<span>Mart</span>
          </span>
          <span className="sidebar-brand-badge">Admin</span>
        </div>

        <div className="sidebar-divider">
          <span>Main Menu</span>
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={handleLinkClick}  // ✅ Close sidebar on click
          >
            <FaChartPie /> Dashboard
          </NavLink>

          <NavLink
            to="/admin/products"
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={handleLinkClick}  // ✅ Close sidebar on click
          >
            <FaBoxOpen /> Products
          </NavLink>

          <NavLink
            to="/admin/add-product"
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={handleLinkClick}  // ✅ Close sidebar on click
          >
            <FaPlusCircle /> Add Product
          </NavLink>

          <NavLink
            to="/admin/orders"
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={handleLinkClick}  // ✅ Close sidebar on click
          >
            <FaShoppingCart /> Orders
          </NavLink>

          <NavLink
            to="/admin/users"
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={handleLinkClick}  // ✅ Close sidebar on click
          >
            <FaUsers /> Users
          </NavLink>

          <NavLink
            to="/admin/analytics"
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={handleLinkClick}  // ✅ Close sidebar on click
          >
            <FaChartLine /> Analytics
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-logout" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
          <div className="sidebar-version">v2.0.0</div>
        </div>
      </div>
    </>
  );
}

export default Sidebar;