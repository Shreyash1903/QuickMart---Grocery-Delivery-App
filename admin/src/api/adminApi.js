// adminAPI.js
import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api/admin",
});

// ✅ Add token only if it's NOT a login request
API.interceptors.request.use((config) => {
  if (config.url === "/login") {
    return config;
  }

  const token = localStorage.getItem("adminToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const getAdminProfile = () => API.get("/profile");
export const updateAdminProfile = (data) => API.put("/profile", data);
export const changeAdminPassword = (data) => API.put("/profile/password", data);

export default API;
