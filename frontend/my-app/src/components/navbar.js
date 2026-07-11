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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    setIsMobileMenuOpen(false);
    navigate("/");
  };

  // ✅ Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // ✅ Close mobile menu on navigation
  const handleNavClick = (path) => {
    setIsMobileMenuOpen(false);
    navigate(path);
  };

  return (
    <header className="blinkit-header">
      <div className="header-container">
        {/* LEFT - Hamburger + Logo */}
        <div className="header-left">
          {/* ✅ Hamburger Menu Button - Mobile only, now on LEFT */}
          <button 
            className={`hamburger-btn ${isMobileMenuOpen ? 'active' : ''}`}
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>

          <div className="logo" onClick={() => handleNavClick("/")}>
            <span className="logo-text">Quick</span>
            <span className="logo-text-highlight">Mart</span>
          </div>

          <div className="location-info desktop-only">
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

        {/* RIGHT - Desktop Nav Items + Cart */}
        <div className="header-right">
          {/* ✅ PRODUCTS BUTTON - Desktop */}
          <button
            className="products-btn desktop-nav-item"
            onClick={() => handleNavClick("/products")}
          >
            <i className="bi bi-grid"></i>
            <span>Products</span>
          </button>

          {/* ✅ WISHLIST BUTTON - Desktop (Only when logged in) */}
          {isLoggedIn && (
            <button
              className="wishlist-nav-btn desktop-nav-item"
              onClick={() => handleNavClick("/wishlist")}
            >
              <i className={`bi bi-heart ${wishlistCount > 0 ? 'has-items' : ''}`}></i>
              <span>Wishlist</span>
              {wishlistCount > 0 && (
                <span className="wishlist-badge">{wishlistCount}</span>
              )}
            </button>
          )}

          {/* ✅ AI SEARCH BUTTON - Desktop (Only when logged in) */}
          {isLoggedIn && (
            <button
              className="ai-search-nav-btn desktop-nav-item"
              onClick={() => handleNavClick("/ai-search")}
            >
              <i className="bi bi-stars"></i>
              <span>AI Search</span>
            </button>
          )}

          {/* ✅ ACCOUNT / LOGIN - Desktop */}
          {isLoggedIn ? (
            <div className="account-dropdown desktop-nav-item">
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
                    onClick={() => handleNavClick("/orders")}
                  >
                    <i className="bi bi-box-seam"></i>
                    <span>My Orders</span>
                  </button>
                  <button
                    className="account-menu-item"
                    onClick={() => handleNavClick("/address")}
                  >
                    <i className="bi bi-geo-alt"></i>
                    <span>Saved Addresses</span>
                  </button>
                  <button
                    className="account-menu-item"
                    onClick={() => handleNavClick("/wishlist")}
                  >
                    <i className="bi bi-heart"></i>
                    <span>My Wishlist</span>
                    {wishlistCount > 0 && (
                      <span className="menu-badge">{wishlistCount}</span>
                    )}
                  </button>
                  <button
                    className="account-menu-item"
                    onClick={() => handleNavClick("/account")}
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
              className="login-nav-btn desktop-nav-item"
              onClick={() => handleNavClick("/login")}
            >
              <i className="bi bi-person"></i>
              <span>Login</span>
            </button>
          )}

          {/* ✅ CART BUTTON */}
          <button 
            className={`cart-btn ${!isLoggedIn ? 'disabled' : ''}`}
            onClick={() => {
              if (isLoggedIn) {
                handleNavClick("/cart");
              } else {
                toast.warning("Please login to view your cart", {
                  position: "top-right",
                  autoClose: 3000,
                });
                handleNavClick("/login");
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

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu-overlay ${isMobileMenuOpen ? 'open' : ''}`} onClick={toggleMobileMenu}></div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-header">
          <div className="mobile-menu-logo">
            <span className="logo-text">Quick</span>
            <span className="logo-text-highlight">Mart</span>
          </div>
          <button className="mobile-menu-close" onClick={toggleMobileMenu}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <div className="mobile-menu-body">
          {/* ❌ LOCATION REMOVED FROM MOBILE MENU */}

          {/* Products */}
          <button 
            className="mobile-menu-item"
            onClick={() => handleNavClick("/products")}
          >
            <i className="bi bi-grid"></i>
            <span>Products</span>
          </button>

          {/* Wishlist - Only when logged in */}
          {isLoggedIn && (
            <button 
              className="mobile-menu-item"
              onClick={() => handleNavClick("/wishlist")}
            >
              <i className="bi bi-heart"></i>
              <span>Wishlist</span>
              {wishlistCount > 0 && (
                <span className="mobile-menu-badge">{wishlistCount}</span>
              )}
            </button>
          )}

          {/* AI Search - Only when logged in */}
          {isLoggedIn && (
            <button 
              className="mobile-menu-item"
              onClick={() => handleNavClick("/ai-search")}
            >
              <i className="bi bi-stars"></i>
              <span>AI Search</span>
            </button>
          )}

          {/* Orders - Only when logged in */}
          {isLoggedIn && (
            <button 
              className="mobile-menu-item"
              onClick={() => handleNavClick("/orders")}
            >
              <i className="bi bi-box-seam"></i>
              <span>My Orders</span>
            </button>
          )}

          {/* Addresses - Only when logged in */}
          {isLoggedIn && (
            <button 
              className="mobile-menu-item"
              onClick={() => handleNavClick("/address")}
            >
              <i className="bi bi-geo-alt"></i>
              <span>Saved Addresses</span>
            </button>
          )}

          {/* Account - Only when logged in */}
          {isLoggedIn && (
            <button 
              className="mobile-menu-item"
              onClick={() => handleNavClick("/account")}
            >
              <i className="bi bi-person"></i>
              <span>My Account</span>
            </button>
          )}

          <div className="mobile-menu-divider"></div>

          {/* Login / Logout */}
          {isLoggedIn ? (
            <button 
              className="mobile-menu-item mobile-logout"
              onClick={handleLogoutClick}
            >
              <i className="bi bi-box-arrow-right"></i>
              <span>Log Out</span>
            </button>
          ) : (
            <button 
              className="mobile-menu-item mobile-login"
              onClick={() => handleNavClick("/login")}
            >
              <i className="bi bi-person"></i>
              <span>Login / Sign Up</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;