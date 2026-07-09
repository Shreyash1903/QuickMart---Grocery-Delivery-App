import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api/admin",
});

// Automatically send JWT token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  console.log(
    "🔍 Token from localStorage:",
    token ? "✅ Found" : "❌ Not found",
  );

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("📤 Sending request with token");
  } else {
    console.log("⚠️ No token found in localStorage!");
  }

  return config;
});

export default API;
