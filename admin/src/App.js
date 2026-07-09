import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import AdminLayout from "./components/AdminLayout.js";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import AddProduct from "./pages/AddProduct";
import EditProduct from "./pages/EditProduct";
import Orders from "./pages/Orders";
import Users from "./pages/Users";
import Analytics from "./pages/Analytics";
import AdminProductDetails from "./pages/ProductDetails";
import OrderDetails from "./pages/OrderDetails";
import UserDetails from "./pages/UserDetails";
import EditUser from "./pages/EditUser";

import "./App.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        // ✅ Check for token in URL (from user frontend redirect)
        const params = new URLSearchParams(window.location.search);
        const urlToken = params.get("token");

        console.log(
          "🔍 Admin App - URL Token:",
          urlToken ? "✅ Found" : "❌ Not found",
        );

        let token = urlToken;

        // ✅ If no token in URL, check localStorage
        if (!token) {
          token = localStorage.getItem("token");
          console.log(
            "🔍 Token from localStorage:",
            token ? "✅ Found" : "❌ Not found",
          );
        }

        // ✅ If token found in URL, save to localStorage
        if (urlToken) {
          console.log("💾 Saving token from URL to localStorage...");
          localStorage.setItem("token", urlToken);

          // ✅ Remove token from URL
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname,
          );
          console.log("🧹 Cleaned URL");
        }

        // ✅ If no token at all, redirect to login
        if (!token) {
          console.log("❌ No token found - Redirecting to login...");
          window.location.href = "http://localhost:3000/login";
          setLoading(false);
          return;
        }

        // ✅ Verify token with backend
        console.log("🔍 Verifying token with backend...");
        const response = await fetch("http://localhost:5000/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("📡 Response status:", response.status);

        if (response.ok) {
          const data = await response.json();
          console.log("✅ Token verified. User:", data.user);

          const userRole = data.user?.role;

          // ✅ Check if user is admin
          if (userRole === "admin") {
            console.log("✅ Admin user verified! Setting authenticated...");
            setIsAuthenticated(true);
          } else {
            // ❌ Not admin
            console.log("❌ User is not admin. Clearing token...");
            localStorage.removeItem("token");
            setIsAuthenticated(false);
            window.location.replace("http://localhost:3000/login");
          }
        } else {
          // ❌ Invalid token
          console.log("❌ Invalid token. Status:", response.status);
          localStorage.removeItem("token");
          setIsAuthenticated(false);
          window.location.href = "http://localhost:3000/login";
        }
      } catch (error) {
        console.error("❌ Token verification error:", error);
        localStorage.removeItem("token");
        setIsAuthenticated(false);
        window.location.replace("http://localhost:3000/login");
      } finally {
        setLoading(false);
      }
    };

    verifyAdmin();
  }, []);

  // ✅ Protected Route Component
  const PrivateRoute = ({ children }) => {
    if (loading) {
      return (
        <div className="admin-loading">
          <div className="loader"></div>
          <p>Loading...</p>
        </div>
      );
    }

    if (!isAuthenticated) {
      return null; // Will redirect in useEffect
    }

    return children;
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loader"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // ✅ If not authenticated, show nothing (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* ✅ Admin Routes - Protected */}
          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <AdminLayout />
              </PrivateRoute>
            }
          >
            {/* Admin Dashboard Routes */}
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />

            {/* Admin Products Routes */}
            <Route path="products" element={<Products />} />
            <Route path="add-product" element={<AddProduct />} />
            <Route path="product/:id" element={<AdminProductDetails />} />
            <Route path="edit-product/:id" element={<EditProduct />} />

            {/* Admin Order Routes */}
            <Route path="orders" element={<Orders />} />
            <Route path="orders/:id" element={<OrderDetails />} />

            {/* Admin User Routes */}
            <Route path="users" element={<Users />} />
            <Route path="users/:id" element={<UserDetails />} />
            <Route path="edit-user/:id" element={<EditUser />} />

            {/* Admin analytics Dashboard */}
            <Route path="analytics" element={<Analytics />} />
          </Route>

          {/* ✅ Redirect root to admin */}
          <Route path="/" element={<Navigate to="/admin" replace />} />

          {/* ✅ Catch all - redirect to admin */}
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </BrowserRouter>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="colored"
        limit={3}
      />
    </>
  );
}

export default App;
