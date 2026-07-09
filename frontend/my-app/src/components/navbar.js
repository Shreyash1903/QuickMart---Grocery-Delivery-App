import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./navbar.css";
import { CART_UPDATED_EVENT, getCart } from "../api/cart";
import { getCurrentLocation } from "../services/locationService";
import SearchBar from "./SearchBar";
import { getWishlist } from "../api/wishlist";

function Navbar({ user, handleLogout }) {
  const navigate = useNavigate();

  const [cartSummary, setCartSummary] = useState({
    itemCount: 0,
    totalPrice: 0,
  });

  const [wishlistCount, setWishlistCount] = useState(0);
  const [location, setLocation] = useState("Fetching location...");

  // ✅ Check if user is logged in
  const isLoggedIn = !!user;

  // ✅ Load wishlist count
  const loadWishlistCount = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setWishlistCount(0);
        return;
      }
      
      const response = await getWishlist();
      const items = response.wishlist || response.items || [];
      setWishlistCount(items.length);
    } catch (error) {
      console.error("Error fetching wishlist count:", error);
      setWishlistCount(0);
    }
  };

  const loadCartSummary = async () => {
    try {
      const cart = await getCart();
      const items = cart.items || [];

      setCartSummary({
        itemCount: items.reduce((total, item) => total + item.quantity, 0),
        totalPrice: cart.totalPrice || 0,
      });
    } catch (error) {
      setCartSummary({
        itemCount: 0,
        totalPrice: 0,
      });
    }
  };

  useEffect(() => {
    loadCartSummary();
    loadWishlistCount();

    const handleCartUpdate = () => {
      loadCartSummary();
    };

    const handleWishlistUpdate = () => {
      loadWishlistCount();
    };

    window.addEventListener(CART_UPDATED_EVENT, handleCartUpdate);
    window.addEventListener('wishlistUpdated', handleWishlistUpdate);

    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, handleCartUpdate);
      window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
    };
  }, []);

  // ✅ Refresh wishlist when user changes (login/logout)
  useEffect(() => {
    loadWishlistCount();
  }, [user]);

  // Fetch current GPS location
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const data = await getCurrentLocation();
        console.log(data);

        const city =
          data.address.city ||
          data.address.town ||
          data.address.village ||
          data.address.county ||
          "";

        const state = data.address.state || "";

        setLocation(`${city}, ${state}`);
      } catch (error) {
        console.log(error);
        setLocation("Location unavailable");
      }
    };

    fetchLocation();
  }, []);

  // Get user initials
  const getInitials = (name) => {
    if (!name) return "U";

    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // ✅ Handle logout
  const handleLogoutClick = () => {
    if (handleLogout) {
      handleLogout();
    }
    window.dispatchEvent(new CustomEvent('authChanged'));
    navigate("/");
  };

  return (
    <header className="blinkit-header">
      <div className="header-container">
        {/* LEFT */}
        <div className="header-left">
          <div className="logo" onClick={() => navigate("/")}>
            <span className="logo-text">Quick</span>
            <span className="logo-text-highlight">Mart</span>
          </div>

          <div className="location-info">
            <div className="address">
              <i className="bi bi-geo-alt"></i>
              <span className="address-text">{location}</span>
              <i
                className="bi bi-chevron-down"
                style={{ fontSize: "12px" }}
              ></i>
            </div>
          </div>
        </div>

        {/* MIDDLE - SearchBar */}
        <div className="header-middle">
          <SearchBar />
        </div>

        {/* RIGHT */}
        <div className="header-right">
          {/* ✅ Products - Always Visible */}
          <button
            className="products-btn"
            onClick={() => navigate("/products")}
          >
            <i className="bi bi-grid"></i>
            <span>Products</span>
          </button>

          {/* ✅ WISHLIST - Only when logged in */}
          {isLoggedIn && (
            <button
              className="wishlist-nav-btn"
              onClick={() => navigate("/wishlist")}
            >
              <i className={`bi bi-heart ${wishlistCount > 0 ? 'has-items' : ''}`}></i>
              <span>Wishlist</span>
              {wishlistCount > 0 && (
                <span className="wishlist-badge">{wishlistCount}</span>
              )}
            </button>
          )}

          {/* ✅ AI SEARCH - Only when logged in */}
          {isLoggedIn && (
            <button
              className="ai-search-nav-btn"
              onClick={() => navigate("/ai-search")}
            >
              <i className="bi bi-stars"></i>
              <span>AI Search</span>
            </button>
          )}

          {/* ✅ Account / Login */}
          {isLoggedIn ? (
            <div className="account-dropdown">
              <div className="account-avatar">{getInitials(user.name)}</div>

              <div className="account-menu">
                {/* User Info */}
                <div className="account-user-info">
                  <div className="account-user-name">{user.name}</div>
                  <div className="account-user-email">
                    {user.email || user.mobileNumber || "user@email.com"}
                  </div>
                </div>

                {/* Menu Items */}
                <div className="account-menu-items">
                  <button
                    className="account-menu-item"
                    onClick={() => navigate("/orders")}
                  >
                    <i className="bi bi-box-seam"></i>
                    <span>My Orders</span>
                  </button>
                  <button
                    className="account-menu-item"
                    onClick={() => navigate("/address")}
                  >
                    <i className="bi bi-geo-alt"></i>
                    <span>Saved Addresses</span>
                  </button>
                  <button
                    className="account-menu-item"
                    onClick={() => navigate("/wishlist")}
                  >
                    <i className="bi bi-heart"></i>
                    <span>My Wishlist</span>
                    {wishlistCount > 0 && (
                      <span className="menu-badge">{wishlistCount}</span>
                    )}
                  </button>
                  <button
                    className="account-menu-item"
                    onClick={() => navigate("/account")}
                  >
                    <i className="bi bi-person"></i>
                    <span>My Account</span>
                  </button>
                </div>

                {/* Logout */}
                <button
                  className="account-logout-btn"
                  onClick={handleLogoutClick}
                >
                  <i className="bi bi-box-arrow-right"></i> Log Out
                </button>
              </div>
            </div>
          ) : (
            <button
              className="login-nav-btn"
              onClick={() => navigate("/login")}
            >
              <i className="bi bi-person"></i>
              <span>Login</span>
            </button>
          )}

          {/* ✅ CART - Always visible, disabled when not logged in */}
          <button 
            className={`cart-btn ${!isLoggedIn ? 'disabled' : ''}`}
            onClick={() => {
              if (isLoggedIn) {
                navigate("/cart");
              } else {
                toast.warning("Please login to view your cart", {
                  position: "top-right",
                  autoClose: 3000,
                });
                navigate("/login");
              }
            }}
            title={!isLoggedIn ? "Please login to view cart" : "View Cart"}
          >
            <i className="bi bi-cart3"></i>
            {isLoggedIn && cartSummary.itemCount > 0 && (
              <span className="cart-badge">{cartSummary.itemCount}</span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;