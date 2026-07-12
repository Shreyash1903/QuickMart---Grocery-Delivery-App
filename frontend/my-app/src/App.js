import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { toast } from "react-toastify";
import "./App.css";
import Home from "./pages/home";
import Products from "./pages/Products";
import ProductDetails from "./components/ProductDetails";
import Address from "./pages/Address";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import VerifyOtp from "./pages/VerifyOtp";
import ResetPassword from "./pages/ResetPassword";
import AiSearch from "./pages/AiSearch";
import Profile from "./pages/Profile";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Navbar from "./components/navbar";
import SplashScreen from "./components/SplashScreen";
import API from "./api/axios";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SavedAddresses from "./pages/SavedAddresses";
import EditAddress from "./pages/EditAddress"; 

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Splash Screen State - Check localStorage
  const [showSplash, setShowSplash] = useState(() => {
    // ✅ Check if splash screen has been shown before
    const splashShown = localStorage.getItem("splashShown");
    // ✅ If not shown before, show splash
    return splashShown !== "true";
  });

  // ✅ Splash Screen Timer - Only runs if splash is shown
  useEffect(() => {
    if (showSplash) {
      const timer = setTimeout(() => {
        setShowSplash(false);
        // ✅ Mark splash screen as shown in localStorage
        localStorage.setItem("splashShown", "true");
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [showSplash]);

  // Get Logged In User
  const getUserData = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await API.get("/me");
      setUser(response.data.user);
    } catch (err) {
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserData();
  }, []);

  // ✅ Updated Logout with Toast
  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);

    // ✅ Success Toast on Logout
    toast.success("👋 Logged out successfully!", {
      position: "top-right",
      autoClose: 3000,
    });
  };

  // Show Splash Screen First
  if (showSplash) {
    return <SplashScreen />;
  }

  // Then Load App
  if (loading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "22px",
          fontWeight: "600",
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <Router>
      <Navbar user={user} handleLogout={handleLogout} />

      <Routes>
        {/* Home */}
        <Route
          path="/"
          element={<Home user={user} getUserData={getUserData} />}
        />

        {/* Products */}
        <Route path="/products" element={<Products />} />

        {/* Product Details */}
        <Route path="/products/:id" element={<ProductDetails />} />

        {/* AI Search */}
        <Route path="/ai-search" element={<AiSearch />} />

        {/* Account / Profile */}
        <Route
          path="/account"
          element={<Profile user={user} getUserData={getUserData} />}
        />

        <Route
          path="/profile"
          element={<Profile user={user} getUserData={getUserData} />}
        />

        {/* Cart */}
        <Route path="/cart" element={<Cart />} />

        {/* Wishlist */}
        <Route path="/wishlist" element={<Wishlist />} />

        {/* Address */}
        <Route path="/address" element={<Address />} />

        {/* Saved Addresses */}
        <Route path="/saved-addresses" element={<SavedAddresses />} />

        {/* ✅ NEW: Edit Address Route */}
        <Route path="/edit-address/:id" element={<EditAddress />} />

        {/* Checkout */}
        <Route path="/checkout" element={<Checkout />} />

        {/* Orders */}
        <Route path="/orders" element={<Orders />} />

        {/* Order Details */}
        <Route path="/orders/:id" element={<OrderDetails />} />

        {/* Login */}
        <Route
          path="/login"
          element={<Home user={user} getUserData={getUserData} />}
        />

        {/* Register */}
        <Route
          path="/register"
          element={<Home user={user} getUserData={getUserData} />}
        />

        {/* Forgot Password */}
        <Route
          path="/forgot-password"
          element={<Home user={user} getUserData={getUserData} />}
        />

        {/* Verify OTP */}
        <Route path="/verify-otp" element={<VerifyOtp />} />

        {/* Reset Password */}
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Invalid Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="colored"
        limit={3}
        toastStyle={{
          borderRadius: "12px",
          fontFamily: "Montserrat, sans-serif",
        }}
      />
    </Router>
  );
}

export default App;
