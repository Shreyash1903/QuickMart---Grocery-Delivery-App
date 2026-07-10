// productsApi.js
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

// PRODUCTS API 

// Get All Products
export const getAllProducts = async () => {
  try {
    const response = await apiClient.get("/products");
    return response.data;
  } catch (error) {
    console.error("Get All Products Error:", error);
    throw error.response?.data || { message: "Failed to fetch products" };
  }
};

// Get Single Product (for View)
export const getProductById = async (productId) => {
  try {
    const response = await apiClient.get(`/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error("Get Product By ID Error:", error);
    throw error.response?.data || { message: "Failed to fetch product" };
  }
};

// Search Products
export const searchProducts = async (params = {}) => {
  try {
    const response = await apiClient.get("/products/search", { params });
    return response.data;
  } catch (error) {
    console.error("Search Products Error:", error);
    throw error.response?.data || { message: "Failed to search products" };
  }
};

// Get Products Search Suggestions (Autocomplete)
export const getSearchSuggestions = async (params = {}) => {
  try {
    const response = await apiClient.get("/products/suggestions", { params });
    return response.data;
  } catch (error) {
    console.error("Get Search Suggestions Error:", error);
    throw error.response?.data || { message: "Failed to get suggestions" };
  }
};

// Add Product
export const addProduct = async (formData) => {
  try {
    const response = await apiClient.post("/products", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Add Product Error:", error);
    throw error.response?.data || { message: "Failed to add product" };
  }
};

// Update Product
export const updateProduct = async (productId, productData) => {
  try {
    const response = await apiClient.put(`/products/${productId}`, productData);
    return response.data;
  } catch (error) {
    console.error("Update Product Error:", error);
    throw error.response?.data || { message: "Failed to update product" };
  }
};

// Delete Product
export const deleteProduct = async (productId) => {
  try {
    const response = await apiClient.delete(`/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error("Delete Product Error:", error);
    throw error.response?.data || { message: "Failed to delete product" };
  }
};

// Get Categories of Products
export const getCategories = async () => {
  try {
    const response = await apiClient.get("/categories");
    return response.data;
  } catch (error) {
    console.error("Get Categories Error:", error);
    throw error.response?.data || { message: "Failed to fetch categories" };
  }
};

// Export all functions as a single object
const productsApi = {
  getAllProducts,
  getProductById,
  searchProducts,
  getSearchSuggestions,
  addProduct,
  updateProduct,
  deleteProduct,
  getCategories,
};

export default productsApi;
