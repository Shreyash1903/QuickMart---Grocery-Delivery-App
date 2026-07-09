import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ProductCard from "../components/ProductCard";
import { aiSearch } from "../api/ai";
import "./aiSearch.css";

const QUICK_PROMPTS = [
  "Milk under 50",
  "Snacks for kids",
  "Fresh fruits",
  "Beverages under 100",
  "Breakfast items",
  "Low price grocery items",
];

function AiSearch() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const navigate = useNavigate();
  const recognitionRef = useRef(null);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const searchAI = async (text) => {
    const value = text.trim();

    if (value.length < 2) {
      toast.warning("Please enter at least 2 characters", {
        position: "top-right",
      });
      return;
    }

    try {
      setLoading(true);
      setHasSearched(true);

      const data = await aiSearch(value);
      setFilters(data.filters || null);
      setProducts(data.products || []);

      if ((data.products || []).length === 0) {
        toast.info("No products matched the AI search", {
          position: "top-right",
        });
      } else {
        toast.success(`Found ${(data.products || []).length} products`, {
          position: "top-right",
        });
      }
    } catch (error) {
      console.error("AI search error:", error);
      toast.error(error.response?.data?.message || "AI search failed", {
        position: "top-right",
      });
      setFilters(null);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    await searchAI(query);
  };

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Speech recognition is not supported in this browser.", {
        position: "top-right",
      });
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      toast.info("Listening... Speak your search", {
        position: "top-right",
      });
    };

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      await searchAI(transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      toast.error("Could not capture your voice input", {
        position: "top-right",
      });
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const resetSearch = () => {
    setQuery("");
    setFilters(null);
    setProducts([]);
    setHasSearched(false);
  };

  const titleLabel = useMemo(() => {
    if (!hasSearched) return "Ask the store";
    if (products.length > 0) return `${products.length} products found`;
    return "No matches found";
  }, [hasSearched, products.length]);

  return (
    <div className="ai-search-page">
      <div className="ai-search-hero">
        <div className="ai-search-copy">
          <span className="ai-badge">AI Search</span>
          <h1>Search by intent, not just keywords</h1>
          <p>
            Ask naturally. The AI will detect category, price range, and useful
            keywords to find the best products for you.
          </p>

          <form className="ai-search-form" onSubmit={handleSearch}>
            <div className="ai-input-shell">
              <i className="bi bi-stars"></i>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask AI... e.g. Show me fruits under 100"
              />
              {query && (
                <button
                  type="button"
                  className="ai-clear-btn"
                  onClick={resetSearch}
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              )}
              <button
                type="button"
                className={`ai-mic-btn ${isListening ? "listening" : ""}`}
                onClick={startListening}
                aria-label="Start voice search"
                title={isListening ? "Listening..." : "Voice search"}
              >
                <i
                  className={`bi ${isListening ? "bi-mic-fill" : "bi-mic"}`}
                ></i>
              </button>
            </div>

            <button type="submit" className="ai-search-btn" disabled={loading}>
              {loading ? "Searching..." : "Search with AI"}
            </button>
          </form>

          <div className="quick-prompts">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                className="prompt-chip"
                onClick={() => setQuery(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        <div className="ai-search-panel">
          <div className="panel-header">
            <span>{titleLabel}</span>
            <button
              type="button"
              className="back-to-products"
              onClick={() => navigate("/products")}
            >
              Browse Products
            </button>
          </div>

          {filters && (
            <div className="filters-summary">
              <div className="summary-chip">
                <span>Category</span>
                <strong>{filters.category || "Any"}</strong>
              </div>
              <div className="summary-chip">
                <span>Max Price</span>
                <strong>
                  {filters.maxPrice ? `₹${filters.maxPrice}` : "Any"}
                </strong>
              </div>
            </div>
          )}

          {!hasSearched ? (
            <div className="panel-empty">
              <i className="bi bi-stars"></i>
              <h3>Smart search preview</h3>
              <p>
                Enter a request and the AI will translate it into filters and
                matching products.
              </p>
            </div>
          ) : loading ? (
            <div className="panel-loading">
              <div className="loading-spinner"></div>
              <p>AI is understanding your request...</p>
            </div>
          ) : products.length > 0 ? (
            <div className="ai-results-grid">
              {products.map((product) => (
                <div key={product._id} className="ai-result-card">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="panel-empty">
              <i className="bi bi-search"></i>
              <h3>No matching products</h3>
              <p>
                Try a different prompt or make the price/category more specific.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AiSearch;
