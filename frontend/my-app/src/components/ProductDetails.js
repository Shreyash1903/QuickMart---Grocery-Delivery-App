import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getProductById, getCategoryProducts } from "../api/product";
import { addToCart, updateQuantity, removeItem, getCart } from "../api/cart";
import "./productDetails.css";

const formatPrice = (value) => `₹ ${Number(value || 0).toLocaleString("en-IN")}`;

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [adding, setAdding] = useState(false);
  const [loadingQty, setLoadingQty] = useState(false);

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");
        
        console.log("🔍 Fetching product with ID:", id);
        
        // ✅ getProductById returns product object directly
        const productData = await getProductById(id);
        
        console.log("✅ Product data received:", productData);
        
        if (productData) {
          setProduct(productData);
          
          // ✅ Fetch related products (same category)
          if (productData.category) {
            try {
              console.log("🔍 Fetching related products for category:", productData.category);
              const relatedData = await getCategoryProducts(productData.category);
              console.log("✅ Related products:", relatedData);
              
              // relatedData is already an array
              const filtered = relatedData.filter(p => p._id !== productData._id);
              setRelatedProducts(filtered.slice(0, 4));
            } catch (relatedErr) {
              console.error("Error fetching related products:", relatedErr);
            }
          }

          // Check if product is in cart
          try {
            const cart = await getCart();
            const item = cart.items?.find(
              item => item.product?._id === productData._id || item.product === productData._id
            );
            if (item) {
              setQuantity(item.quantity);
            }
          } catch (cartErr) {
            console.error("Error checking cart:", cartErr);
          }
        } else {
          setError("Product not found");
        }
      } catch (err) {
        console.error("❌ Error fetching product:", err);
        console.error("❌ Error response:", err.response?.data);
        
        if (err.response?.status === 404) {
          setError("Product not found");
        } else {
          setError(err.response?.data?.message || "Failed to load product");
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    } else {
      setError("Invalid product ID");
      setLoading(false);
    }
  }, [id]);

  // Handle Add to Cart
  const handleAddToCart = async () => {
    try {
      setAdding(true);
      await addToCart(product._id);
      setQuantity(1);
      
      toast.success(`🛒 ${product.name} added to cart!`, {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("❌ Failed to add product to cart", {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setAdding(false);
    }
  };

  // Handle Quantity Increase
  const handleIncrease = async () => {
    try {
      setLoadingQty(true);
      const newQuantity = quantity + 1;
      await updateQuantity(product._id, newQuantity);
      setQuantity(newQuantity);
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("❌ Failed to update quantity", {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setLoadingQty(false);
    }
  };

  // Handle Quantity Decrease
  const handleDecrease = async () => {
    try {
      setLoadingQty(true);
      if (quantity <= 1) {
        await removeItem(product._id);
        setQuantity(0);
        toast.info("🗑️ Item removed from cart", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        const newQuantity = quantity - 1;
        await updateQuantity(product._id, newQuantity);
        setQuantity(newQuantity);
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("❌ Failed to update quantity", {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setLoadingQty(false);
    }
  };

  // Calculate discount percentage
  const discountPercentage = product?.discountPrice && product?.price > product?.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  if (loading) {
    return (
      <div className="product-details-page">
        <div className="product-details-loading">
          <div className="loading-spinner"></div>
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-details-page">
        <div className="product-details-error">
          <div className="error-icon">😕</div>
          <h2>Product not found</h2>
          <p>{error || "The product you're looking for doesn't exist."}</p>
          <button className="back-btn" onClick={() => navigate("/products")}>
            <i className="bi bi-arrow-left"></i> Back to Products
          </button>
        </div>
      </div>
    );
  }

  const inStock = product.stock !== undefined ? product.stock > 0 : true;

  return (
    <div className="product-details-page">
      <div className="product-details-container">
        {/* ===== BREADCRUMB ===== */}
        <div className="breadcrumb">
          <span onClick={() => navigate("/")}>Home</span>
          <i className="bi bi-chevron-right"></i>
          <span onClick={() => navigate("/products")}>Products</span>
          <i className="bi bi-chevron-right"></i>
          <span className="current">{product.name || "Product"}</span>
        </div>

        {/* ===== MAIN CONTENT ===== */}
        <div className="product-details-main">
          {/* LEFT - Image Gallery */}
          <div className="product-gallery">
            <div className="main-image">
              <img
                src={product.image || 'https://via.placeholder.com/500x500/f0f0f0/666?text=Product'}
                alt={product.name || "Product"}
              />
              {discountPercentage > 0 && (
                <span className="image-discount-badge">{discountPercentage}% OFF</span>
              )}
              {!inStock && (
                <span className="image-out-of-stock">Out of Stock</span>
              )}
            </div>
          </div>

          {/* RIGHT - Product Info */}
          <div className="product-info-section">
            <div className="product-category-tag">{product.category || "Product"}</div>
            <h1 className="product-title">{product.name || "Product"}</h1>

            {/* Description */}
            <p className="product-description">
              {product.description || "Fresh and high-quality product. Perfect for your daily needs."}
            </p>

            {/* Price */}
            <div className="product-pricing">
              <div className="price-container">
                <span className="current-price">
                  {formatPrice(product.discountPrice || product.price || 0)}
                </span>
                {product.discountPrice > 0 && product.discountPrice < product.price && (
                  <>
                    <span className="original-price">{formatPrice(product.price)}</span>
                    <span className="saved-amount">
                      Save {formatPrice(product.price - product.discountPrice)}
                    </span>
                  </>
                )}
              </div>
              {product.quantity && (
                <span className="product-unit">📦 {product.quantity}</span>
              )}
            </div>

            {/* Quantity & Add to Cart */}
            <div className="product-actions">
              {quantity === 0 ? (
                <button
                  className="add-to-cart-btn large"
                  onClick={handleAddToCart}
                  disabled={adding || !inStock}
                >
                  {adding ? (
                    <>
                      <span className="spinner"></span> Adding...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-cart-plus"></i> Add to Cart
                    </>
                  )}
                </button>
              ) : (
                <div className="quantity-control-large">
                  <button
                    className="qty-btn"
                    onClick={handleDecrease}
                    disabled={loadingQty}
                  >
                    <i className="bi bi-dash"></i>
                  </button>
                  <span className="qty-number">{quantity}</span>
                  <button
                    className="qty-btn"
                    onClick={handleIncrease}
                    disabled={loadingQty}
                  >
                    <i className="bi bi-plus"></i>
                  </button>
                </div>
              )}

              <button
                className="buy-now-btn"
                onClick={() => navigate("/checkout")}
                disabled={quantity === 0 || !inStock}
              >
                Buy Now
              </button>
            </div>

            {/* Features */}
            <div className="product-features">
              <div className="feature-item">
                <i className="bi bi-truck"></i>
                <div>
                  <strong>Free Delivery</strong>
                  <span>On orders above ₹ 500</span>
                </div>
              </div>
              <div className="feature-item">
                <i className="bi bi-arrow-return-left"></i>
                <div>
                  <strong>Easy Returns</strong>
                  <span>7 days return policy</span>
                </div>
              </div>
              <div className="feature-item">
                <i className="bi bi-shield-check"></i>
                <div>
                  <strong>Secure Payment</strong>
                  <span>100% secure checkout</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== RELATED PRODUCTS ===== */}
        {relatedProducts.length > 0 && (
          <div className="related-products-section">
            <h2 className="related-title">
              <i className="bi bi-grid"></i> You May Also Like
            </h2>
            <div className="related-products-grid">
              {relatedProducts.map((product) => (
                <div
                  key={product._id}
                  className="related-product-card"
                  onClick={() => navigate(`/products/${product._id}`)}
                >
                  <img src={product.image || 'https://via.placeholder.com/200x200/f0f0f0/666?text=Product'} alt={product.name} />
                  <h4>{product.name}</h4>
                  <div className="related-price">
                    <span className="related-discount-price">
                      {formatPrice(product.discountPrice || product.price)}
                    </span>
                    {product.discountPrice > 0 && product.discountPrice < product.price && (
                      <span className="related-original-price">{formatPrice(product.price)}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductDetails;