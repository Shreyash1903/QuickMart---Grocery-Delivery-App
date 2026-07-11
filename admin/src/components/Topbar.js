import React from "react";
import { useNavigate } from "react-router-dom";
import { FaBars, FaBell, FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import "./Topbar.css";

function Topbar({ toggleSidebar, onLogout }) {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate("/admin/profile");
  };
  return (
    <div className="topbar">
      <div className="topbar-left">
        <button className="topbar-menu-btn" onClick={toggleSidebar}>
          <FaBars size={20} />
        </button>
        <span className="topbar-title">Dashboard</span>
      </div>

      <div className="topbar-right">
        <button className="topbar-notification">
          <FaBell size={18} />
          <span className="notification-dot"></span>
        </button>

        <button
          className="topbar-user"
          onClick={handleProfileClick}
          type="button"
        >
          <FaUserCircle size={32} className="topbar-avatar" />
          <div className="topbar-user-info">
            <span className="topbar-user-name">Admin</span>
          </div>
        </button>

        <button className="topbar-logout" onClick={onLogout}>
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </div>
  );
}

export default Topbar;
