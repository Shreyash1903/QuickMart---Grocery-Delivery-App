import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/adminApi";
import {
  FaSearch,
  FaEdit,
  FaTrash,
  FaUser,
  FaUserCheck,
  FaUserTimes,
  FaEnvelope,
  FaCalendarAlt,
  FaUsers,
  FaShieldAlt,
  FaPhone,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { toast } from "react-toastify";
import "./Users.css";

function Users() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, currentPage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/users?search=${searchTerm}&page=${currentPage}&limit=10`);
      setUsers(res.data.users || []);
      setTotalUsers(res.data.totalUsers || 0);
      setTotalPages(res.data.totalPages || 1);
      setError("");
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users");
      toast.error("❌ Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await API.delete(`/users/${id}`);
      toast.success("🗑️ User deleted successfully!");
      fetchUsers();
    } catch (err) {
      toast.error("❌ Failed to delete user");
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name) => {
    const colors = ['', 'green', 'orange', 'pink', 'cyan', 'purple'];
    const index = name ? name.length % colors.length : 0;
    return colors[index] || '';
  };

  if (loading && users.length === 0) {
    return (
      <div className="users-loading">
        <div className="loading-spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className="users-container">
      {/* ===== HEADER ===== */}
      <div className="users-header">
        <div className="users-header-left">
          <h1 className="users-title">
            <FaUsers className="title-icon" />
            Users
          </h1>
          <span className="users-count">{totalUsers} users</span>
        </div>
      </div>

      {error && <div className="users-error">{error}</div>}

      {/* ===== SEARCH ===== */}
      <div className="users-search">
        <div className="search-box-wrapper">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="clear-search" onClick={() => setSearchTerm("")}>
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ===== USER CARDS GRID ===== */}
      {users.length === 0 ? (
        <div className="users-empty">
          <div className="empty-icon">👤</div>
          <h3>No users found</h3>
          <p>{searchTerm ? `No results found for "${searchTerm}"` : "No users registered yet"}</p>
        </div>
      ) : (
        <>
          <div className="users-grid">
            {users.map((user) => (
              <div key={user._id} className="user-card">
                {/* ===== CARD HEADER ===== */}
                <div className="user-card-header">
                  <div className="user-card-avatar-wrapper">
                    <div className={`user-card-avatar ${getAvatarColor(user.name)}`}>
                      {getInitials(user.name)}
                    </div>
                  </div>
                  <div className="user-card-header-info">
                    <h3 className="user-card-name">{user.name}</h3>
                    <span className="user-card-role">
                      {user.role === 'admin' ? (
                        <>
                          <FaShieldAlt className="role-icon" />
                          <span className="role-badge admin">Admin</span>
                        </>
                      ) : (
                        <span className="role-badge">User</span>
                      )}
                    </span>
                  </div>
                  <span className={`user-card-status ${user.isActive !== false ? 'active' : 'inactive'}`}>
                    {user.isActive !== false ? (
                      <><FaUserCheck /> Active</>
                    ) : (
                      <><FaUserTimes /> Inactive</>
                    )}
                  </span>
                </div>

                {/* ===== CARD BODY ===== */}
                <div className="user-card-body">
                  <div className="user-card-info-item">
                    <FaEnvelope className="info-icon" />
                    <span className="info-text">{user.email}</span>
                  </div>
                  <div className="user-card-info-item">
                    <FaCalendarAlt className="info-icon" />
                    <span className="info-text">Joined {formatDate(user.createdAt)}</span>
                  </div>
                </div>

                {/* ===== CARD FOOTER ===== */}
                <div className="user-card-footer">
                  <button
                    className="action-btn view-btn"
                    onClick={() => navigate(`/admin/users/${user._id}`)}
                    title="View"
                  >
                    <FaUser /> View
                  </button>
                  <button
                    className="action-btn edit-btn"
                    onClick={() => navigate(`/admin/edit-user/${user._id}`)}
                    title="Edit"
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    className="action-btn delete-btn"
                    onClick={() => handleDelete(user._id)}
                    title="Delete"
                  >
                    <FaTrash /> Delete
                  </button>
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

          <div className="users-footer">
            <span>Showing {users.length} of {totalUsers} users</span>
          </div>
        </>
      )}
    </div>
  );
}

export default Users;