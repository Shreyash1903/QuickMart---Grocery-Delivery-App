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
import AdminLogin from "./pages/AdminLogin";
import "./App.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const token = localStorage.getItem("adminToken");

        // ✅ If no admin token, don't block login route
        if (!token) {
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        const apiBaseUrl =
          process.env.REACT_APP_API_URL || "http://localhost:5000";
        const response = await fetch(`${apiBaseUrl.replace(/\/$/, "")}/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.user?.role === "admin") {
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem("adminToken");
            setIsAuthenticated(false);
          }
        } else {
          localStorage.removeItem("adminToken");
          setIsAuthenticated(false);
        }
      } catch (error) {
        localStorage.removeItem("adminToken");
        setIsAuthenticated(false);
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
      return <Navigate to="/login" replace />;
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

  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Admin Login Route */}
          <Route
            path="/login"
            element={<AdminLogin setIsAuthenticated={setIsAuthenticated} />}
          />

          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <AdminLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<Dashboard />} />

            {/* Admin Dashboard */}
            <Route path="dashboard" element={<Dashboard />} />

            {/* Product Management */}
            <Route path="products" element={<Products />} />
            <Route path="add-product" element={<AddProduct />} />
            <Route path="product/:id" element={<AdminProductDetails />} />
            <Route path="edit-product/:id" element={<EditProduct />} />

            {/* Order Management */}
            <Route path="orders" element={<Orders />} />
            <Route path="orders/:id" element={<OrderDetails />} />

            {/* User Management */}
            <Route path="users" element={<Users />} />
            <Route path="users/:id" element={<UserDetails />} />
            <Route path="edit-user/:id" element={<EditUser />} />

            {/* Analytics */}
            <Route path="analytics" element={<Analytics />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
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
