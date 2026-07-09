import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { searchProducts, searchSuggestions } from "../api/product";
import "./SearchBar.css";

function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]); // ✅ New: Dedicated suggestions state
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isSuggestionMode, setIsSuggestionMode] = useState(true); // ✅ New: Suggestion mode toggle
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const debounceTimer = useRef(null);

  // ✅ Updated: Fetch suggestions (autocomplete) instead of full search
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (query.trim().length < 2) {
      setSuggestions([]);
      setResults([]);
      setLoading(false);
      setShowResults(false);
      return;
    }

    setLoading(true);
    setIsSuggestionMode(true);

    debounceTimer.current = setTimeout(async () => {
      try {
        // ✅ Use dedicated suggestions API
        const data = await searchSuggestions(query.trim());
        setSuggestions(data || []);
        setResults([]); // Clear full search results
        setShowResults(true);
      } catch (error) {
        console.error("Suggestion error:", error);
        setSuggestions([]);
        
        // ✅ Fallback: If suggestions API fails, try full search
        try {
          const fallbackData = await searchProducts(query.trim());
          setResults(fallbackData || []);
          setSuggestions([]);
          setIsSuggestionMode(false);
          setShowResults(true);
        } catch (fallbackError) {
          console.error("Fallback search error:", fallbackError);
          toast.error("❌ Failed to search products", {
            position: "top-right",
            autoClose: 4000,
          });
        }
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query]);

  // Close results on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim().length >= 2) {
      setShowResults(false);
      navigate(`/products?search=${encodeURIComponent(query)}`);
    } else {
      toast.warning("⚠️ Please enter at least 2 characters", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleResultClick = (productId) => {
    setShowResults(false);
    setQuery("");
    setSuggestions([]);
    setResults([]);
    navigate(`/products/${productId}`);
  };

  // ✅ FIXED: Clear search and navigate to products page without search param
  const clearSearch = () => {
    setQuery("");
    setSuggestions([]);
    setResults([]);
    setShowResults(false);
    // ✅ Yeh line add karo - Products page par bhejo WITHOUT search param
    navigate("/products");
  };

  const formatPrice = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

  // ✅ Get display data (suggestions or full results)
  const getDisplayData = () => {
    if (isSuggestionMode && suggestions.length > 0) {
      return suggestions;
    }
    if (!isSuggestionMode && results.length > 0) {
      return results;
    }
    return [];
  };

  const displayData = getDisplayData();

  return (
    <div className="search-container" ref={searchRef}>
      <form className="search-bar-wrapper" onSubmit={handleSearch}>
        <i className="bi bi-search search-icon"></i>
        <input
          type="text"
          className="search-input"
          placeholder="Search for products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query.trim().length >= 2 && displayData.length > 0) {
              setShowResults(true);
            }
          }}
        />
        {query && (
          <button type="button" className="clear-btn" onClick={clearSearch}>
            <i className="bi bi-x-circle"></i>
          </button>
        )}
        {loading && (
          <div className="search-loader">
            <div className="loader-spinner"></div>
          </div>
        )}
      </form>

      {/* Search Results Dropdown */}
      {showResults && query.trim().length >= 2 && (
        <div className="search-results">
          {displayData.length > 0 ? (
            <>
              <div className="results-header">
                <span>
                  {isSuggestionMode ? 'Suggestions' : `${displayData.length} result${displayData.length > 1 ? 's' : ''} found`}
                </span>
                <button 
                  type="button"
                  className="view-all-btn"
                  onClick={handleSearch}
                >
                  View All
                </button>
              </div>
              {displayData.map((product) => (
                <div
                  key={product._id}
                  className="result-item"
                  onClick={() => handleResultClick(product._id)}
                >
                  <img 
                    src={product.image || 'https://via.placeholder.com/50x50/f0f0f0/666?text=Product'} 
                    alt={product.name} 
                  />
                  <div className="result-info">
                    <span className="result-name">
                      {product.name}
                      {product.discountPrice && product.discountPrice < product.price && (
                        <span className="discount-badge">
                          {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
                        </span>
                      )}
                    </span>
                    <span className="result-category">{product.category}</span>
                  </div>
                  <span className="result-price">
                    {product.discountPrice ? (
                      <>
                        <span className="original-price">{formatPrice(product.price)}</span>
                        <span className="discount-price">{formatPrice(product.discountPrice)}</span>
                      </>
                    ) : (
                      formatPrice(product.price)
                    )}
                  </span>
                </div>
              ))}
            </>
          ) : (
            <div className="no-results">
              <i className="bi bi-search"></i>
              <p>No products found for "{query}"</p>
              <span>Try searching with different keywords</span>
            </div>
          )}

          {!loading && query.trim().length >= 2 && displayData.length > 0 && (
            <div className="search-footer">
              <button type="button" onClick={handleSearch}>
                <i className="bi bi-arrow-right"></i> See all results for "{query}"
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchBar;