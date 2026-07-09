import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ProductCard from "../components/ProductCard";
import { getWishlist } from "../api/wishlist";
import "./wishlist.css";

function Wishlist() {
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadWishlist = async () => {
    try {
      setLoading(true);
      const response = await getWishlist();
      console.log("🔍 Wishlist API Response:", response);

      // ✅ Support both response formats
      const items = response.wishlist || response.items || [];
      console.log("📦 Items to display:", items);

      setWishlistItems(items);
    } catch (error) {
      console.error("❌ Error fetching wishlist:", error);
      console.error("Error details:", error.response?.data || error.message);
      setWishlistItems([]);
      toast.error("❌ Failed to load wishlist", {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    loadWishlist();
  }, [navigate]);

  const handleWishlistChange = (product, isWishlisted) => {
    if (!isWishlisted) {
      setWishlistItems((currentItems) =>
        currentItems.filter(
          (item) => (item.product?._id || item.product) !== product._id,
        ),
      );

      // ✅ Update count in navbar
      window.dispatchEvent(
        new CustomEvent("wishlistUpdated", {
          detail: { action: "remove" },
        }),
      );
    }
  };

  return (
    <div className="wishlist-page-wrapper">
      {/* ===== HEADER ===== */}
      <div className="wishlist-header">
        <div className="wishlist-header-left">
          <div className="wishlist-icon-wrapper">
            <span className="wishlist-heart-icon">❤️</span>
          </div>
          <div>
            <p className="wishlist-eyebrow">✨ Saved for later</p>
            <h1>My Wishlist</h1>
            <p className="wishlist-subtitle">
              {wishlistItems.length > 0
                ? `You have ${wishlistItems.length} item${wishlistItems.length > 1 ? "s" : ""} in your wishlist`
                : "Products you mark with the heart icon appear here."}
            </p>
          </div>
        </div>
        <button className="wishlist-cta" onClick={() => navigate("/products")}>
          <i className="bi bi-grid"></i>
          Browse
        </button>
      </div>

      {/* ===== LOADING ===== */}
      {loading ? (
        <div className="wishlist-loading-state">
          <div className="loading-spinner"></div>
          <p>Loading your wishlist...</p>
        </div>
      ) : wishlistItems.length > 0 ? (
        <>
          {/* ===== ITEMS GRID ===== */}
          <div className="wishlist-items-grid">
            {wishlistItems.map((item, index) => {
              const product = item.product || item;

              if (!product?._id) {
                return null;
              }

              return (
                <div
                  key={item._id || product._id}
                  className="wishlist-item-card"
                  style={{ "--delay": `${index * 0.05}s` }}
                >
                  <ProductCard
                    product={product}
                    initialWishlisted={true}
                    onWishlistChange={handleWishlistChange}
                  />
                </div>
              );
            })}
          </div>

          {/* ===== WISHLIST STATS ===== */}
          <div className="wishlist-stats">
            <div className="stat-item">
              <span className="stat-number">{wishlistItems.length}</span>
              <span className="stat-label">Items Saved</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">❤️</span>
              <span className="stat-label">All Favorites</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <button
                className="stat-action-btn"
                onClick={() => navigate("/products")}
              >
                <i className="bi bi-plus-circle"></i> Add More
              </button>
            </div>
          </div>
        </>
      ) : (
        /* ===== EMPTY STATE ===== */
        <div className="wishlist-empty-state">
          <div className="empty-state-content">
            <div className="empty-heart-icon">💔</div>
            <h3>Your wishlist is empty</h3>
            <p>Tap the heart icon ❤️ on any product card to save it here.</p>
            <button
              className="empty-state-btn"
              onClick={() => navigate("/products")}
            >
              <i className="bi bi-heart"></i> Start Shopping
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Wishlist;
