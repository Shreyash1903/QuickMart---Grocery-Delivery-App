import React, { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "./AdminLayout.css";

function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  // ✅ Check if admin is authenticated
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      // ❌ No admin token - Redirect to admin login
      navigate("/login");
    }
  }, [navigate]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // ✅ Logout function
  const handleLogout = () => {
    // Clear only the admin session token
    localStorage.removeItem("adminToken");

    // Show success message
    toast.success("👋 Logged out successfully!", {
      position: "top-right",
      autoClose: 3000,
    });

    // Redirect to admin login
    navigate("/login");
  };

  return (
    <div className="admin-layout">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="admin-main">
        <Topbar toggleSidebar={toggleSidebar} onLogout={handleLogout} />
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;
