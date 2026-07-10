// ordersApi.js
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

// ================= ORDER ROUTES =================

// Get All Orders
export const getAllOrders = async (params = {}) => {
  try {
    const response = await apiClient.get("/orders", { params });
    return response.data;
  } catch (error) {
    console.error("Get All Orders Error:", error);
    throw error.response?.data || { message: "Failed to fetch orders" };
  }
};

// GET orders with search
export const searchOrders = async (params = {}) => {
  try {
    const response = await apiClient.get("/orders/search", { params });
    return response.data;
  } catch (error) {
    console.error("Search Orders Error:", error);
    throw error.response?.data || { message: "Failed to search orders" };
  }
};

// Get Single Order by ID
export const getOrderById = async (orderId) => {
  try {
    const response = await apiClient.get(`/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error("Get Order By ID Error:", error);
    throw error.response?.data || { message: "Failed to fetch order" };
  }
};

// Update Order Status
export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await apiClient.put(`/orders/${orderId}/status`, {
      orderStatus: status,
    });
    return response.data;
  } catch (error) {
    console.error("Update Order Status Error:", error);
    throw error.response?.data || { message: "Failed to update order status" };
  }
};

// Delete Order by ID
export const deleteOrder = async (orderId) => {
  try {
    const response = await apiClient.delete(`/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error("Delete Order Error:", error);
    throw error.response?.data || { message: "Failed to delete order" };
  }
};

// ================= DASHBOARD ROUTE =================

// Dashboard Data
export const getDashboardStats = async () => {
  try {
    const response = await apiClient.get("/dashboard");
    return response.data;
  } catch (error) {
    console.error("Get Dashboard Stats Error:", error);
    throw (
      error.response?.data || { message: "Failed to fetch dashboard stats" }
    );
  }
};

// Export all functions as a single object
const ordersApi = {
  getAllOrders,
  searchOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  getDashboardStats,
};

export default ordersApi;
