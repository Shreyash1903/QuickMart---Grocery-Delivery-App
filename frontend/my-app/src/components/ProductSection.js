import React, { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { 
  getallProducts, 
  searchProducts,
  getCategoryProducts 
} from "../api/product";
import ProductCard from "./ProductCard";
import "./product.css";

function ProductSection({ initialCategory = "", initialSearch = "" }) {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || initialSearch;
  const categoryQuery = searchParams.get('category') || initialCategory;

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(categoryQuery || "all");
  const [sortBy, setSortBy] = useState("default");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showInStock, setShowInStock] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sectionRef = useRef(null);

  // ✅ Set initial category from props
  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      let result;

      // ✅ If category is selected, fetch category products
      if (selectedCategory && selectedCategory !== "all") {
        console.log("📦 Fetching category products:", selectedCategory);
        result = await getCategoryProducts(selectedCategory);
        console.log("✅ Category products:", result.length);
        
        setProducts(result);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(result.map(p => p.category).filter(Boolean))];
        setCategories(uniqueCategories);
        
        applyFilters(result, selectedCategory, sortBy, minPrice, maxPrice, showInStock);
        return;
      }

      // ✅ If search query exists
      if (searchQuery && searchQuery.trim().length > 0) {
        console.log("🔍 Searching for:", searchQuery);
        result = await searchProducts(searchQuery.trim());
        console.log("✅ Search results:", result.length);
        
        setProducts(result);
        
        const uniqueCategories = [...new Set(result.map(p => p.category).filter(Boolean))];
        setCategories(uniqueCategories);
        
        applyFilters(result, selectedCategory, sortBy, minPrice, maxPrice, showInStock);
        return;
      }

      // ✅ Get all products
      console.log("📦 Fetching all products...");
      result = await getallProducts();
      console.log("✅ All products:", result.length);
      
      setProducts(result);
      
      const uniqueCategories = [...new Set(result.map(p => p.category).filter(Boolean))];
      setCategories(uniqueCategories);
      
      applyFilters(result, selectedCategory, sortBy, minPrice, maxPrice, showInStock);
      
    } catch (error) {
      console.error("❌ Error loading products:", error);
      toast.error(error.response?.data?.message || "❌ Failed to load products", {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (productList, category, sort, min, max, inStock) => {
    let filtered = [...productList];

    // Category filter
    if (category && category !== "all") {
      filtered = filtered.filter(p => p.category === category);
    }

    // Price range filter
    if (min && !isNaN(min)) {
      filtered = filtered.filter(p => p.price >= Number(min));
    }
    if (max && !isNaN(max)) {
      filtered = filtered.filter(p => p.price <= Number(max));
    }

    // In Stock filter
    if (inStock) {
      filtered = filtered.filter(p => p.stock > 0);
    }

    // Sorting
    switch (sort) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "popular":
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        break;
    }

    setFilteredProducts(filtered);
  };

  // ✅ Load products when dependencies change
  useEffect(() => {
    loadProducts();
  }, [searchQuery, selectedCategory]);

  // Apply filters when any filter changes
  useEffect(() => {
    if (products.length > 0) {
      applyFilters(products, selectedCategory, sortBy, minPrice, maxPrice, showInStock);
    }
  }, [selectedCategory, sortBy, minPrice, maxPrice, showInStock]);

  const resetFilters = () => {
    setSelectedCategory("all");
    setSortBy("default");
    setMinPrice("");
    setMaxPrice("");
    setShowInStock(false);
    
    toast.info("🔄 Filters reset successfully", {
      position: "top-right",
      autoClose: 3000,
    });

    if (searchQuery) {
      window.location.href = '/products';
    }
  };

  if (loading) {
    return (
      <section className="products-section">
        <div className="products-header">
          <h2 className="section-title">
            <span className="title-underline">Daily Essentials</span>
          </h2>
        </div>
        <div className="products-grid shimmer-products">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="shimmer-product-card">
              <div className="shimmer-image"></div>
              <div className="shimmer-text"></div>
              <div className="shimmer-text short"></div>
              <div className="shimmer-price"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="products-section" ref={sectionRef}>
      {/* ===== SEARCH HEADER ===== */}
      {searchQuery && (
        <div className="search-results-header">
          <h2>
            <i className="bi bi-search"></i> Results for "<span className="search-highlight">{searchQuery}</span>"
          </h2>
          <span className="result-count">{filteredProducts.length} products found</span>
        </div>
      )}

      {/* ===== MOBILE FILTER TOGGLE ===== */}
      <div className="filter-toggle-container">
        <button 
          className="filter-toggle-btn" 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <i className="bi bi-funnel"></i> Filters
          {(selectedCategory !== "all" || minPrice || maxPrice || showInStock || sortBy !== "default") && (
            <span className="filter-active-dot"></span>
          )}
        </button>
        <span className="product-count">{filteredProducts.length} products</span>
      </div>

      <div className="products-layout">
        {/* ===== SIDEBAR FILTERS ===== */}
        <div className={`products-sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <h3>
              <i className="bi bi-funnel"></i> Filters
            </h3>
            <button className="sidebar-close-btn" onClick={() => setIsSidebarOpen(false)}>
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          <div className="sidebar-filters">
            {/* Category Filter */}
            <div className="filter-group sidebar-filter-group">
              <label className="filter-label">Category</label>
              <select
                className="filter-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div className="filter-group sidebar-filter-group">
              <label className="filter-label">Sort By</label>
              <select
                className="filter-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="default">Default</option>
                <option value="price-low">Price: Low → High</option>
                <option value="price-high">Price: High → Low</option>
                <option value="newest">Newest First</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>

            {/* Price Range */}
            <div className="filter-group sidebar-filter-group">
              <label className="filter-label">Price Range</label>
              <div className="price-range-inputs">
                <input
                  type="number"
                  className="price-input"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
                <span className="price-sep">-</span>
                <input
                  type="number"
                  className="price-input"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
            </div>

            {/* In Stock */}
            <div className="filter-group sidebar-filter-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={showInStock}
                  onChange={(e) => setShowInStock(e.target.checked)}
                />
                <span>In Stock Only</span>
              </label>
            </div>

            {/* Reset Filters */}
            <button className="reset-filters-btn sidebar-reset-btn" onClick={resetFilters}>
              <i className="bi bi-arrow-counterclockwise"></i> Reset Filters
            </button>
          </div>
        </div>

        {/* ===== OVERLAY ===== */}
        {isSidebarOpen && (
          <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
        )}

        {/* ===== PRODUCTS GRID ===== */}
        <div className="products-grid-wrapper">
          {filteredProducts.length > 0 ? (
            <div className="products-grid">
              {filteredProducts.map((product, index) => (
                <div 
                  key={product._id} 
                  className="product-card-animated"
                  style={{ '--delay': `${index * 0.05}s` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h3>No Products Found</h3>
              <p>
                {searchQuery 
                  ? `No products found for "${searchQuery}"` 
                  : "Try adjusting your filters or check back later"}
              </p>
              <button className="reset-filters-btn" onClick={resetFilters}>
                {searchQuery ? "Clear Search" : "Reset Filters"}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default ProductSection;