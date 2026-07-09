// ➡️ React aur hooks import kiye.
import React, { useEffect, useState, useRef } from "react";

// ➡️ Routing ke liye. location → Current URL deta hai.
import { useNavigate, useLocation } from "react-router-dom";

// ➡️ Notification dikhane ke liye.
import { toast } from "react-toastify";

// ➡️ Modal ke andar ye components show honge.
import Login from "./login";
import Register from "./register";
import ForgotPassword from "./ForgotPassword";

// ➡️ Axios instance import.
import API from "../api/axios";
import "./home.css";

// ➡️ Home component.
function Home({ user, getUserData }) {
  const [isLoginOpen, setIsLoginOpen] = useState(false); // Login modal open hai ya nahi.
  const [modalMode, setModalMode] = useState("login"); // Kaunsa modal khulega.
  const [isScrolled, setIsScrolled] = useState(false); // Page scroll hua ya nahi.
  const [activeCategory, setActiveCategory] = useState(null); // Mouse kis category pe hai.
  const heroRef = useRef(null); // Hero section ka reference.
  const categoryRefs = useRef([]); // Saare category div ka reference.
  const navigate = useNavigate(); // Page navigate karne ke liye.
  const location = useLocation(); // Current URL.

  // ✅ Store category for after login redirect
  const [pendingCategory, setPendingCategory] = useState(null);

  // Scroll effects
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Parallax effect for hero
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!heroRef.current) return;
      const { left, top, width, height } =
        heroRef.current.getBoundingClientRect();
      const x = (e.clientX - left) / width - 0.5;
      const y = (e.clientY - top) / height - 0.5;
      heroRef.current.style.setProperty("--mouse-x", x);
      heroRef.current.style.setProperty("--mouse-y", y);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    if (location.pathname === "/login") {
      setModalMode("login");
      setIsLoginOpen(true);
    } else if (location.pathname === "/register") {
      setModalMode("register");
      setIsLoginOpen(true);
    } else if (location.pathname === "/forgot-password") {
      setModalMode("forgot");
      setIsLoginOpen(true);
    } else {
      setIsLoginOpen(false);
    }
  }, [location.pathname]);

  // Login page open.
  const openLogin = () => navigate("/login");

  // Register page open.
  const openRegister = () => navigate("/register");

  // Navigate to home page aur modal close.
  const closeModal = () => navigate("/");

  // ✅ Category Click Handler - Store category and check login
  const handleCategoryClick = (categoryName) => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      // ✅ User not logged in - Store category and show login
      setPendingCategory(categoryName);
      openLogin();
      toast.info("Please login to view products", {
        position: "top-right",
        autoClose: 3000,
      });
    } else {
      // ✅ User logged in - Direct navigate
      navigate(`/products?category=${encodeURIComponent(categoryName)}`);
    }
  };

  // Home Data States
  const [homeData, setHomeData] = useState(null);
  const [loadingHome, setLoadingHome] = useState(true);
  const [homeError, setHomeError] = useState(null);

  // Home data lane wala function.
  const fetchHome = async () => {
    try {
      setLoadingHome(true);
      const res = await API.get("/home"); // API call to fetch home data
      setHomeData(res.data);
      setHomeError(null);
    } catch (err) {
      setHomeError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load home data",
      );
    } finally {
      setLoadingHome(false);
    }
  };

  useEffect(() => {
    fetchHome();
  }, []);

  // ✅ Handle login success - Redirect to category if pending
  const handleLoginSuccess = (user, token) => {
    getUserData();

    if (user?.role === "admin") {
      const adminBaseUrl =
        process.env.REACT_APP_ADMIN_URL ||
        "http://localhost:3001";
      const normalizedAdminUrl = adminBaseUrl.endsWith("/admin")
        ? adminBaseUrl
        : `${adminBaseUrl.replace(/\/$/, "")}/admin`;

      window.location.href = token
        ? `${normalizedAdminUrl}?token=${encodeURIComponent(token)}`
        : normalizedAdminUrl;
    } else {
      // ✅ Check if there's a pending category
      if (pendingCategory) {
        const category = pendingCategory;
        setPendingCategory(null); // Clear pending category
        navigate(`/products?category=${encodeURIComponent(category)}`);
      } else {
        navigate("/products");
      }
    }
  };

  // Enhanced loading with shimmer effect
  if (loadingHome) {
    return (
      <div className="dashboard-loading">
        <div className="shimmer-wrapper">
          <div className="shimmer-hero"></div>
          <div className="shimmer-grid">
            <div className="shimmer-card"></div>
            <div className="shimmer-card"></div>
            <div className="shimmer-card"></div>
          </div>
          <div className="shimmer-categories">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="shimmer-category"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (homeError) {
    return (
      <div className="dashboard-loading">
        <div className="alert alert-danger">{homeError}</div>
        <button className="btn-retry" onClick={fetchHome}>
          <i className="bi bi-arrow-repeat"></i> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Floating Action Button */}
      <button
        className="fab-button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <i className="bi bi-chevron-up"></i>
      </button>

      <main className="dashboard-main-blinkit">
        {/* Hero Section with Parallax */}
        <section className="hero-banner" ref={heroRef}>
          <div className="hero-background-glow"></div>
          <div className="hero-particles">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="particle"
                style={{
                  "--delay": i * 0.5 + "s",
                  "--duration": 3 + Math.random() * 2 + "s",
                  "--size": 4 + Math.random() * 8 + "px",
                }}
              ></div>
            ))}
          </div>
          <div className="banner-content">
            <div className="banner-badge">
              <i className="bi bi-lightning-fill"></i> Fast Delivery
            </div>
            <h1 className="banner-title">
              {homeData.banner.title}
              <span className="gradient-text">Fresh & Fast</span>
            </h1>
            <p className="banner-subtitle">{homeData.banner.subtitle}</p>
            <div className="banner-actions">
              <button className="shop-now-btn">
                <span>Shop Now</span>
                <i className="bi bi-arrow-right"></i>
              </button>
              <button className="explore-btn">
                <i className="bi bi-play-circle"></i> Explore
              </button>
            </div>
            <div className="banner-stats">
              <div className="stat-item">
                <span className="stat-number">10K+</span>
                <span className="stat-label">Products</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">4.8★</span>
                <span className="stat-label">Ratings</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">30min</span>
                <span className="stat-label">Delivery</span>
              </div>
            </div>
          </div>
          <div className="banner-image">
            <div className="image-floating-elements">
              <div className="float-item float-1">🍎</div>
              <div className="float-item float-2">🥑</div>
              <div className="float-item float-3">🥦</div>
            </div>
            <img src={homeData.banner.image} alt="Groceries" />
          </div>
        </section>

        {/* Promo Section with 3D Hover */}
        <section className="promo-section">
          {homeData.promo.map((p, index) => (
            <div
              key={p.id}
              className={`promo-card ${p.id}`}
              style={p.bg ? { background: p.bg } : {}}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform =
                  "translateY(-10px) scale(1.02)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0) scale(1)";
              }}
            >
              <div className="promo-card-glow"></div>
              <div className="promo-text">
                <div className="promo-icon-wrapper">
                  <i className={`bi ${p.icon}`}></i>
                </div>
                <h3>{p.title}</h3>
                <p>{p.subtitle}</p>
                <button className="order-btn">
                  <span>Order Now</span>
                  <i className="bi bi-arrow-right-short"></i>
                </button>
              </div>
              <div className="promo-img">
                <div className="promo-emoji">{p.emoji || "🛒"}</div>
              </div>
            </div>
          ))}
        </section>

        {/* Categories with Infinite Scroll Animation */}
        <section className="categories-section">
          <div className="categories-header">
            <h2 className="section-title">
              <span className="title-underline">Categories</span>
            </h2>
            <button className="view-all-btn" onClick={() => navigate("/products")}>
              View All <i className="bi bi-arrow-right"></i>
            </button>
          </div>
          <div className="categories-grid">
            {homeData.categories.map((cat, idx) => (
              <div
                key={idx}
                className={`category-item ${activeCategory === idx ? "active" : ""}`}
                ref={(el) => (categoryRefs.current[idx] = el)}
                onMouseEnter={() => setActiveCategory(idx)}
                onMouseLeave={() => setActiveCategory(null)}
                onClick={() => handleCategoryClick(cat.name)}
              >
                <div className="category-icon-wrapper">
                  <i className={`bi ${cat.icon}`}></i>
                  <div className="category-ripple"></div>
                </div>
                <span className="category-name">{cat.name}</span>
                <div className="category-hover-line"></div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Login Modal */}
      {isLoginOpen && (
        <div className="login-modal-overlay" onClick={closeModal}>
          <div
            className="login-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="close-modal" onClick={closeModal}>
              <i className="bi bi-x"></i>
            </button>
            <div className="login-modal-header">
              <div className="modal-icon">
                {modalMode === "login"
                  ? "🔐"
                  : modalMode === "register"
                    ? "📝"
                    : "🔑"}
              </div>
              <h2 className="login-title">
                {modalMode === "login"
                  ? "Welcome Back !"
                  : modalMode === "register"
                    ? "Create Account"
                    : "Reset Password"}
              </h2>
              <p className="login-subtitle">
                {modalMode === "login"
                  ? "Sign in to continue shopping"
                  : modalMode === "register"
                    ? "Sign up to continue shopping"
                    : ""}
              </p>
            </div>
            <div className="login-modal-body">
              {modalMode === "login" ? (
                <>
                  <Login
                    isModal={true} // Ye ek prop hai.
                    onLoginSuccess={handleLoginSuccess}
                  />
                  <div className="modal-footer-text">
                    Don't have an account ?
                    <button className="modal-switch-btn" onClick={openRegister}>
                      Create an Account
                    </button>
                  </div>
                </>
              ) : modalMode === "register" ? (
                <>
                  <Register
                    isModal={true}
                    onRegisterSuccess={() => {
                      openLogin();
                    }}
                  />
                  <div className="modal-footer-text">
                    Already have an account ?
                    <button className="modal-switch-btn" onClick={openLogin}>
                      Login
                    </button>
                  </div>
                </>
              ) : (
                <ForgotPassword
                  isModal={true}
                  onSuccess={() => {
                    navigate("/verify-otp");
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;