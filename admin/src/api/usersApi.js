// usersApi.js
import axios from "axios";

const API_BASE_PATH = process.env.REACT_APP_API_URL || "http://localhost:5000";
const API_BASE_URL = API_BASE_PATH.endsWith("/api/admin")
  ? API_BASE_PATH
  : `${API_BASE_PATH.replace(/\/$/, "")}/api/admin`;

// Get auth token from localStorage for admin requests
const getAuthToken = () => localStorage.getItem("adminToken");

// Axios instance with default headers
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to every request
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// ================= USER ROUTES =================

// Get All Users
export const getAllUsers = async (params = {}) => {
  try {
    const response = await apiClient.get("/users", { params });
    return response.data;
  } catch (error) {
    console.error("Get All Users Error:", error);
    throw error.response?.data || { message: "Failed to fetch users" };
  }
};

// Get Single User by ID
export const getUserById = async (userId) => {
  try {
    const response = await apiClient.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Get User By ID Error:", error);
    throw error.response?.data || { message: "Failed to fetch user" };
  }
};

// Update User by ID
export const updateUser = async (userId, userData) => {
  try {
    const response = await apiClient.put(`/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error("Update User Error:", error);
    throw error.response?.data || { message: "Failed to update user" };
  }
};

// Delete User by ID Delete user by ID
export const deleteUser = async (userId) => {
  try {
    const response = await apiClient.delete(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Delete User Error:", error);
    throw error.response?.data || { message: "Failed to delete user" };
  }
};

// Admin login function
export const adminLogin = async (credentials) => {
  try {
    const response = await apiClient.post("/login", credentials);
    return response.data;
  } catch (error) {
    console.error("Admin Login Error:", error);
    throw error.response?.data || { message: "Login failed" };
  }
};

// Export all functions as a single object
const usersApi = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  adminLogin,
};

export default usersApi;
