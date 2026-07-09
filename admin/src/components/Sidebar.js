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
} from "react-icons/fa";
import "./Sidebar.css";

function Sidebar({ isOpen, toggleSidebar }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // ✅ Clear admin token
    localStorage.removeItem("adminToken");
    localStorage.removeItem("token"); // Agar 'token' key use kar rahe ho toh
    
    // ✅ Redirect to user frontend (port 3000)
    window.location.href = "http://localhost:3000";
    
    // Optional: Close sidebar on logout
    if (isOpen) toggleSidebar();
  };

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}
      
      <div className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand">
          <span className="sidebar-brand-icon">🛒</span>
          <span className="sidebar-brand-text">Quick<span>Cart</span></span>
          <span className="sidebar-brand-badge">Admin</span>
        </div>

        <div className="sidebar-divider">
          <span>Main Menu</span>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/admin" end className={({ isActive }) => isActive ? 'active' : ''}>
            <FaChartPie /> Dashboard
          </NavLink>

          <NavLink to="/admin/products" className={({ isActive }) => isActive ? 'active' : ''}>
            <FaBoxOpen /> Products
          </NavLink>

          <NavLink to="/admin/add-product" className={({ isActive }) => isActive ? 'active' : ''}>
            <FaPlusCircle /> Add Product
          </NavLink>

          <NavLink to="/admin/orders" className={({ isActive }) => isActive ? 'active' : ''}>
            <FaShoppingCart /> Orders
          </NavLink>

          <NavLink to="/admin/users" className={({ isActive }) => isActive ? 'active' : ''}>
            <FaUsers /> Users
          </NavLink>

          <NavLink to="/admin/analytics" className={({ isActive }) => isActive ? 'active' : ''}>
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