import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllProducts,
  searchProducts,
  getSearchSuggestions,
  getCategories,
  deleteProduct,
} from "../api/productsApi";
import {
  FaEdit,
  FaTrash,
  FaEye,
  FaPlus,
  FaSearch,
  FaImage,
  FaTimes,
  FaSpinner,
  FaTag,
  FaBox,
} from "react-icons/fa";
import { toast } from "react-toastify";
import "./Products.css";

function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState(null);
  const searchRef = useRef(null);
  const suggestionRef = useRef(null);

  // ===== FETCH PRODUCTS WITH BACKEND SEARCH =====
  const fetchProducts = useCallback(async (search = "", category = "all") => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (search && search.trim()) {
        params.append("q", search.trim());
      }
      if (category && category !== "all") {
        params.append("category", category);
      }

      let res;
      if (search && search.trim()) {
        res = await searchProducts({
          q: search.trim(),
          category,
        });
      } else if (category && category !== "all") {
        res = await searchProducts({ category });
      } else {
        res = await getAllProducts();
      }

      setProducts(res.products || []);
      setTotalProducts(res.totalProducts || 0);
      setError("");
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products");
      toast.error("❌ Failed to load products");
    } finally {
      setLoading(false);
    }
  }, []);

  // ===== FETCH SUGGESTIONS =====
  const fetchSuggestions = async (query) => {
    if (!query || query.trim().length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      setSuggestionLoading(true);
      const res = await getSearchSuggestions({
        q: query.trim(),
        limit: 8,
      });
      setSuggestions(res.suggestions || []);
      setShowSuggestions((res.suggestions || []).length > 0);
    } catch (error) {
      console.error("Suggestion error:", error);
      setSuggestions([]);
    } finally {
      setSuggestionLoading(false);
    }
  };

  // ===== INITIAL LOAD =====
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // ===== FETCH CATEGORIES =====
  const fetchCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res.categories || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  // ===== DEBOUNCED SUGGESTIONS =====
  useEffect(() => {
    if (debounceTimer) clearTimeout(debounceTimer);

    const timer = setTimeout(() => {
      if (searchTerm.trim().length >= 1) {
        fetchSuggestions(searchTerm);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 200);

    setDebounceTimer(timer);

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, [searchTerm]);

  // ===== CLICK OUTSIDE SUGGESTIONS =====
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionRef.current &&
        !suggestionRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ===== HANDLE SEARCH SUBMIT =====
  const handleSearch = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    fetchProducts(searchTerm, selectedCategory);
  };

  // ===== HANDLE SUGGESTION CLICK =====
  const handleSuggestionClick = (product) => {
    setSearchTerm(product.name);
    setShowSuggestions(false);
    fetchProducts(product.name, selectedCategory);
  };

  // ===== HANDLE CATEGORY CHANGE =====
  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setSelectedCategory(category);
    fetchProducts(searchTerm, category);
  };

  // ===== CLEAR SEARCH =====
  const clearSearch = () => {
    setSearchTerm("");
    setSuggestions([]);
    setShowSuggestions(false);
    fetchProducts("", selectedCategory);
  };

  // ===== DELETE PRODUCT =====
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    try {
      await deleteProduct(id);
      toast.success("🗑️ Product deleted successfully!");
      fetchProducts(searchTerm, selectedCategory);
    } catch (err) {
      toast.error("❌ Failed to delete product");
    }
  };

  // ✅ Format Price
  const formatPrice = (value) => {
    return `₹ ${Number(value || 0).toLocaleString("en-IN")}`;
  };

  if (loading && products.length === 0) {
    return (
      <div className="products-loading">
        <div className="loading-spinner"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <div className="products-container">
      {/* ===== HEADER ===== */}
      <div className="products-header">
        <div className="products-header-left">
          <h1 className="products-title">
            <i className="bi bi-box-seam"></i> Products
          </h1>
          <span className="products-count">{totalProducts} products</span>
        </div>
        <button
          className="add-product-btn"
          onClick={() => navigate("/admin/add-product")}
        >
          <FaPlus /> Add Product
        </button>
      </div>

      {error && <div className="products-error">{error}</div>}

      {/* ===== SEARCH & FILTERS ===== */}
      <div className="products-filters" ref={searchRef}>
        <div className="search-box-wrapper">
          <form className="search-box" onSubmit={handleSearch}>
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => {
                if (suggestions.length > 0) setShowSuggestions(true);
              }}
              autoComplete="off"
            />
            {searchTerm && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={clearSearch}
              >
                <FaTimes />
              </button>
            )}
            {suggestionLoading && (
              <div className="suggestion-loader">
                <FaSpinner className="spinning" />
              </div>
            )}
          </form>

          {/* ===== SUGGESTIONS DROPDOWN ===== */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="suggestions-dropdown" ref={suggestionRef}>
              <div className="suggestions-header">
                <span>Suggestions</span>
                <span className="suggestions-count">
                  {suggestions.length} results
                </span>
              </div>
              {suggestions.map((product) => (
                <div
                  key={product.id}
                  className="suggestion-item"
                  onClick={() => handleSuggestionClick(product)}
                >
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="suggestion-image"
                    />
                  ) : (
                    <div className="suggestion-image-placeholder">
                      <FaImage />
                    </div>
                  )}
                  <div className="suggestion-info">
                    <span className="suggestion-name">{product.name}</span>
                    <span className="suggestion-category">
                      {product.category}
                    </span>
                  </div>
                  <span className="suggestion-price">
                    {formatPrice(product.discountPrice || product.price)}
                  </span>
                </div>
              ))}
              <div className="suggestions-footer">
                <button
                  onClick={() => {
                    setShowSuggestions(false);
                    fetchProducts(searchTerm, selectedCategory);
                  }}
                >
                  <FaSearch /> Search for "{searchTerm}"
                </button>
              </div>
            </div>
          )}
        </div>

        <select
          className="category-filter"
          value={selectedCategory}
          onChange={handleCategoryChange}
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* ===== PRODUCT CARDS GRID ===== */}
      {products.length === 0 ? (
        <div className="products-empty">
          <div className="empty-icon">📦</div>
          <h3>{searchTerm ? "No products found" : "No products yet"}</h3>
          <p>
            {searchTerm
              ? `No results found for "${searchTerm}"`
              : "Add your first product to get started."}
          </p>
          {searchTerm && (
            <button className="clear-search-btn large" onClick={clearSearch}>
              Clear Search
            </button>
          )}
          {!searchTerm && (
            <button
              className="add-product-btn"
              onClick={() => navigate("/admin/add-product")}
            >
              <FaPlus /> Add Product
            </button>
          )}
        </div>
      ) : (
        <div className="products-grid">
          {products.map((product) => (
            <div key={product._id} className="product-card">
              {/* ===== IMAGE ===== */}
              <div className="product-card-image">
                {product.image ? (
                  <img src={product.image} alt={product.name} />
                ) : (
                  <div className="product-card-image-placeholder">
                    <FaImage />
                  </div>
                )}
                {/* Stock Badge */}
                <span
                  className={`product-card-stock ${product.stock > 0 ? "in-stock" : "out-of-stock"}`}
                >
                  {product.stock > 0 ? `${product.stock}` : "0"}
                </span>
              </div>

              {/* ===== DETAILS ===== */}
              <div className="product-card-body">
                <div className="product-card-header">
                  <h3 className="product-card-name" title={product.name}>
                    {product.name}
                  </h3>
                  <span className="product-card-category">
                    <FaTag className="card-icon" />
                    {product.category || "Uncategorized"}
                  </span>
                </div>

                <div className="product-card-pricing">
                  <span className="product-card-price">
                    {formatPrice(product.price)}
                  </span>
                  {product.discountPrice &&
                    product.discountPrice < product.price && (
                      <span className="product-card-discount-price">
                        {formatPrice(product.discountPrice)}
                      </span>
                    )}
                </div>

                {/* ✅ Quantity Display */}
                {product.quantity && (
                  <div className="product-card-quantity">
                    <FaBox className="card-icon" />
                    <span>{product.quantity}</span>
                  </div>
                )}

                {/* ===== ACTION BUTTONS ===== */}
                <div className="product-card-footer">
                  <div className="product-card-actions">
                    <button
                      className="action-btn view-btn"
                      onClick={() => navigate(`/admin/product/${product._id}`)}
                      title="View"
                    >
                      <FaEye />
                    </button>
                    <button
                      className="action-btn edit-btn"
                      onClick={() =>
                        navigate(`/admin/edit-product/${product._id}`)
                      }
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDelete(product._id)}
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===== FOOTER ===== */}
      <div className="products-footer">
        <span>
          Showing {products.length} of {totalProducts} products
          {searchTerm && ` (filtered by "${searchTerm}")`}
        </span>
      </div>
    </div>
  );
}

export default Products;
