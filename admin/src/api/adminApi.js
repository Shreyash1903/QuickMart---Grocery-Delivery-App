// adminAPI.js
import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api/admin",
});

// ✅ Add token only if it's NOT a login request
API.interceptors.request.use((config) => {
  // Skip token for login endpoint
  if (config.url === "/login") {
    console.log("🔓 Login endpoint - skipping token");
    return config;
  }

  const token = localStorage.getItem("adminToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("📤 Sending request with admin token");
  } else {
    console.log("⚠️ No adminToken found!");
  }

  return config;
});

export default API;