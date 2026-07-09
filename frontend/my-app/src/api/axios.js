// Ye file tumhare "Frontend ka API Service Layer hai." 
// Iska kaam hai backend se baat karna aur automatically JWT token attach karna.

// Axios HTTP Requests bhejne ke liye use hoti hai.
// Example
// axios.get()
// axios.post()
// axios.put()
// axios.delete()

import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000", // Backend API URL
  headers: { // Backend ko batana Body JSON format me aa rahi hai.
    "Content-Type": "application/json",
  },
});

// Request Interceptor - Attach JWT token
// Har request bhejne se pehle Ye function execute hoga.
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Browser se JWT Token read karna.
 
    // Check Token hai ya nahi. Agar token hai to Authorization header me attach karna.
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response Interceptor - Handle errors and token expiration
// Har response receive hone ke baad.
API.interceptors.response.use(
  (response) => response,
  (error) => {

    // Handle 401 Unauthorized (token expired or invalid)
    if (error.response?.status === 401) {
      localStorage.removeItem("token"); // Expired token delete kar do.

      // Check if we are on the dashboard/home page which allows guest access
      const isPublicPage =
        window.location.pathname === "/" ||
        window.location.pathname === "/me" ||
        window.location.pathname === "/login" ||
        window.location.pathname === "/register" ||
        window.location.pathname === "/forgot-password" ||
        window.location.pathname === "/verify-otp" ||
        window.location.pathname.startsWith("/reset-password");
      if (!isPublicPage) {
        window.location.href = "/login";
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error("Access forbidden");
    }

    // Handle 500 Server Error
    if (error.response?.status === 500) {
      console.error("Server error. Please try again later.");
    }

    return Promise.reject(error);
  },
);

export default API;

// Login, Google Login, Update Profile, Change Password ke liye API functions
export const loginUser = async (credentials) => {
  const response = await API.post("/login", credentials);
  return response.data;
};

export const googleLogin = async (credential) => {
  const response = await API.post("/google-login", { token: credential });
  return response.data;
};

export const updateProfile = async (profileData) => {
  const response = await API.put("/profile", profileData);
  return response.data;
};

export const changePassword = async (passwordData) => {
  const response = await API.put("/change-password", passwordData);
  return response.data;
};
