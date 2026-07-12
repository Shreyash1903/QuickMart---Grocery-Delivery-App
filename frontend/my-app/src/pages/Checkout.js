// useState → Stores data (cart, addresses, payment method, etc.).
// useEffect → Runs code when the page loads.
// useMemo → Computes derived values (total items) efficiently.
import React, { useEffect, useMemo, useState } from "react";

// useNavigate → Allows navigation to different pages (cart, address, orders).
import { useNavigate } from "react-router-dom";

// Calls the backend API to fetch all saved addresses.
import { getAddresses } from "../api/address";

// Calls the backend API to fetch cart data and notify when cart is updated.
import { getCart, notifyCartUpdated } from "../api/cart";

// Calls the backend to create the order.
import { placeOrder } from "../api/orders";

// These are your Razorpay APIs.
// POST /payment/create-order - Creates a Razorpay Order.
// POST /payment/verify-payment - Verifies the Razorpay Payment.
import { createOrder, verifyPayment } from "../api/payment";
import { toast } from "react-toastify";
import "./checkout.css";

// Formats a number into Indian Rupees format (e.g., ₹ 1,234.00).
const formatPrice = (value) =>
  `₹ ${Number(value || 0).toLocaleString("en-IN")}`;

// This function dynamically loads the Razorpay SDK script into the page.
// Download: https://checkout.razorpay.com/v1/checkout.js
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js"; // Load Razorpay SDK from their CDN
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

// Checkout Page Component
function Checkout() {
  const navigate = useNavigate(); // It is used to move from one page to another.
  const [addresses, setAddresses] = useState([]);
  const [cart, setCart] = useState({ items: [], totalPrice: 0 });
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery"); // Stores which payment option is selected.
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false); // Used while placing the order.
  const [error, setError] = useState(""); // Stores error messages.

  const loadCheckoutData = async () => {
    try {
      setLoading(true);

      const [addressData, cartData] = await Promise.all([
        getAddresses(),
        getCart(),
      ]);

      const nextAddresses = addressData.addresses || [];
      const nextCart = {
        items: cartData.items || [],
        totalPrice: cartData.totalPrice || 0,
      };

      setAddresses(nextAddresses);
      setCart(nextCart);
      setSelectedAddressId(
        nextAddresses.find((address) => address.isDefault)?._id ||
          nextAddresses[0]?._id ||
          "",
      );
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load checkout data",
      );
    } finally {
      setLoading(false);
    }
  };

  // This runs when the Checkout page opens.
  useEffect(() => {
    loadCheckoutData();
  }, []);

  const totalItems = useMemo(
    () => cart.items.reduce((total, item) => total + item.quantity, 0),
    [cart.items],
  );

  // This function creates the order after everything is ready.
  // It is used by both: Cash on Delivery and Online Payment
  // This function does not care whether the "payment is COD" or "Online.""
  // It only needs selectedPaymentMethod
  // If - finalizeOrder("Cash on Delivery")
  // ↓
  // Order saved as COD.
  // If - finalizeOrder("Online")
  // ↓
  // Order saved as Online Payment.
  // So this same function is reused for both payment methods.

  const finalizeOrder = async (selectedPaymentMethod) => {
    await placeOrder({
      // Calls the backend API to place the order.
      addressId: selectedAddressId, // Sends the selected address ID.
      paymentMethod: selectedPaymentMethod, // Sends the selected payment method (Cash on Delivery or Online).
    });

    // After placing the order, it clears the cart and notifies other parts of the app that the cart has been updated.
    notifyCartUpdated(); //

    // ✅ Success Toast
    toast.success("🎉 Order placed successfully!", {
      position: "top-right",
      autoClose: 4000,
    });

    // After placing the order, it navigates to the Orders page.
    navigate("/orders", { replace: true });
  };

  // This function is called only when the user selects "Online Payment" and clicks "Pay & Place Order"
  const handleOnlinePayment = async () => {
    const scriptLoaded = await loadRazorpayScript(); // Load Razorpay SDK script dynamically

    // If the Razorpay SDK script fails to load, it shows an error message and stops the payment process.
    if (!scriptLoaded) {
      // If Razorpay SDK couldn't load,
      const errorMsg = "Razorpay SDK failed to load. Please try again.";
      setError(errorMsg); // stores the error.
      toast.error(`❌ ${errorMsg}`, {
        position: "top-right",
        autoClose: 4000,
      });
      return;
    }

    // If the Razorpay key is not configured in the frontend environment, it shows an error message and stops the payment process.
    if (!process.env.REACT_APP_RAZORPAY_KEY_ID) {
      const errorMsg =
        "Razorpay key is not configured in the frontend environment.";
      setError(errorMsg);
      toast.error(`❌ ${errorMsg}`, {
        position: "top-right",
        autoClose: 4000,
      });
      return;
    }

    // Get Amount in Rupees from the cart. If cart.totalPrice is undefined, it defaults to 0.
    const amountInRupees = cart.totalPrice || 0;

    try {
      setSubmitting(true); // Button becomes Opening Payment...
      setError(""); // Clears previous errors.

      // Create Razorpay Order by calling the backend API. The backend will create an order in Razorpay and return the order details.
      // POST /payment/create-order
      // orderData will contain the Razorpay order details.
      const orderData = await createOrder(amountInRupees);

      // This object tells Razorpay how to open the payment window.
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID, // Your Razorpay Key ID
        amount: orderData.order.amount, // Amount in paise (₹1 = 100 paise)
        currency: orderData.order.currency, // Currency = Indian Rupees
        name: "QuickMart", // Your company or product name
        description: "Online order payment", // Description of the payment
        order_id: orderData.order.id, // Razorpay Order ID returned from the backend
        handler: async (response) => {
          try {
            await verifyPayment(response); // Verify the payment by calling the backend API. The backend will verify the payment signature with Razorpay.

            // This runs only if the payment is verified successfully. It finalizes the order as "Online Payment."
            await finalizeOrder("Online", {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
            });
          } catch (verifyError) {
            const errorMsg =
              verifyError.response?.data?.message ||
              "Payment verification failed";
            setError(errorMsg);
            toast.error(`❌ ${errorMsg}`, {
              position: "top-right",
              autoClose: 4000,
            });
          } finally {
            setSubmitting(false);
          }
        },
        prefill: {
          name:
            addresses.find((address) => address._id === selectedAddressId)
              ?.fullName || "",
          contact:
            addresses.find((address) => address._id === selectedAddressId)
              ?.mobileNumber || "",
        },
        theme: {
          color: "#0c831f",
        },
        modal: {
          ondismiss: () => {
            setSubmitting(false);
          },
        },
      };

      // This creates the Razorpay Checkout instance using the options you prepared.
      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", () => {
        // If the payment fails, it shows an error message.
        const errorMsg = "Payment failed. Please try again.";
        setError(errorMsg);
        toast.error(`❌ ${errorMsg}`, {
          position: "top-right",
          autoClose: 4000,
        });
        setSubmitting(false);
      });

      // Open the Razorpay checkout shortly after the user tap to avoid mobile browsers
      // treating the payment window as a blocked popup when the request is delayed.
      requestAnimationFrame(() => {
        try {
          razorpay.open();
        } catch (openError) {
          const errorMsg =
            openError?.message || "Unable to open Razorpay checkout";
          setError(errorMsg);
          toast.error(`❌ ${errorMsg}`, {
            position: "top-right",
            autoClose: 4000,
          });
          setSubmitting(false);
        }
      });
    } catch (err) {
      setSubmitting(false);
      const errorMsg = err.response?.data?.message || "Failed to start payment";
      setError(errorMsg);
      toast.error(`❌ ${errorMsg}`, {
        position: "top-right",
        autoClose: 4000,
      });
    }
  };

  // This function runs first when the user clicks "Place Order" or "Pay & Place Order"
  const handlePlaceOrder = async (event) => {
    event.preventDefault();

    if (!selectedAddressId) {
      const errorMsg = "Please select a delivery address";
      setError(errorMsg);
      toast.warning(`⚠️ ${errorMsg}`, {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    // If the user selects "Online Payment," it calls the handleOnlinePayment function to start the Razorpay payment process.
    // Condition becomes false if the user selects "Cash on Delivery," so it skips handleOnlinePayment().
    if (paymentMethod === "Online") {
      await handleOnlinePayment();
      return;
    }

    try {
      setSubmitting(true); // Button becomes Placing Order...
      setError(""); // Clears previous errors.

      // If the user selects "Cash on Delivery," it directly finalizes the order without going through Razorpay.
      await finalizeOrder("Cash on Delivery");
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to place order";
      setError(errorMsg);
      toast.error(`❌ ${errorMsg}`, {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Edit Address - Navigate to address page with edit mode
  const handleEditAddress = (addressId) => {
    navigate(`/edit-address/${addressId}`);
  };

  if (loading) {
    return <div className="checkout-page-loading">Loading checkout...</div>;
  }

  if (!cart.items.length) {
    return (
      <div className="checkout-page-shell">
        <div className="checkout-empty-state">
          <div className="empty-cart-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Add products before placing an order.</p>
          <button
            className="checkout-secondary-btn browse-btn"
            onClick={() => navigate("/products")}
          >
            <i className="bi bi-shop"></i> Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page-shell">
      <div className="checkout-page-header">
        <div className="checkout-header-left">
          <h1>
            <i className="bi bi-bag-check"></i> Checkout
          </h1>
          <span className="checkout-item-count">{totalItems} items</span>
        </div>

        <div className="checkout-header-actions">
          <button
            className="checkout-secondary-btn back-btn"
            onClick={() => navigate("/cart")}
          >
            <i className="bi bi-arrow-left"></i> Back
          </button>
          <button
            className="checkout-secondary-btn add-address-btn"
            onClick={() => navigate("/address")}
          >
            <i className="bi bi-plus-circle"></i> Add Address
          </button>
        </div>
      </div>

      {error && <div className="checkout-page-error">{error}</div>}

      <div className="checkout-layout">
        <form className="checkout-form-card" onSubmit={handlePlaceOrder}>
          <div className="section-heading">
            <h2>Delivery Address</h2>
            <p>Select where this order should be delivered.</p>
          </div>

          {!addresses.length ? (
            <div className="checkout-empty-address">
              <div className="empty-address-icon">📍</div>
              <h3>No Delivery Address Found</h3>
              <p>Please add a delivery address to place your order</p>
              <button
                type="button"
                className="add-address-primary-btn"
                onClick={() => navigate("/address")}
              >
                <i className="bi bi-plus-circle"></i> Add New Address
              </button>
            </div>
          ) : (
            <div className="checkout-address-list">
              {addresses.map((address) => (
                <label
                  key={address._id}
                  className={`checkout-address-item ${
                    selectedAddressId === address._id ? "selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="address"
                    value={address._id}
                    checked={selectedAddressId === address._id}
                    onChange={() => setSelectedAddressId(address._id)}
                  />

                  <div className="address-content">
                    <div className="address-top-row">
                      <div className="address-header">
                        <strong>{address.fullName}</strong>
                        {address.isDefault && (
                          <span className="default-badge">Default</span>
                        )}
                      </div>
                      {/* Edit Button - Top Right */}
                      <button
                        type="button"
                        className="edit-address-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditAddress(address._id);
                        }}
                      >
                        <i className="bi bi-pencil"></i> Edit
                      </button>
                    </div>
                    <p className="address-detail">
                      {address.houseNo}, {address.area}, {address.city},{" "}
                      {address.state} - {address.pincode}
                    </p>
                    <span className="address-mobile">
                      {address.mobileNumber}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          )}

          <div className="section-heading checkout-payment-heading">
            <h2>Payment Method</h2>
            <p>Choose how you want to pay.</p>
          </div>

          <div className="checkout-payment-list">
            <label
              className={`checkout-payment-item ${
                paymentMethod === "Cash on Delivery" ? "selected" : ""
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === "Cash on Delivery"}
                onChange={() => setPaymentMethod("Cash on Delivery")}
              />
              <span className="payment-icon">💵</span>
              <div>
                <strong>Cash on Delivery</strong>
                <p>Pay when you receive your order</p>
              </div>
            </label>

            <label
              className={`checkout-payment-item ${
                paymentMethod === "Online" ? "selected" : ""
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === "Online"}
                onChange={() => setPaymentMethod("Online")}
              />
              <span className="payment-icon">💳</span>
              <div>
                <strong>Online Payment</strong>
                <p>Pay securely via Razorpay</p>
              </div>
            </label>
          </div>

          <button
            type="submit"
            className="checkout-primary-btn"
            disabled={submitting || !selectedAddressId || !addresses.length}
          >
            {submitting ? (
              <>
                <span className="btn-spinner"></span>
                {paymentMethod === "Online"
                  ? "Opening Payment..."
                  : "Placing Order..."}
              </>
            ) : paymentMethod === "Online" ? (
              <>
                <i className="bi bi-credit-card"></i> Pay & Place Order
              </>
            ) : (
              <>
                <i className="bi bi-bag-check"></i> Place Order
              </>
            )}
          </button>
        </form>

        {/* ===== ORDER SUMMARY - WITH CART ITEMS ===== */}
        <aside className="checkout-summary-card">
          <h2>
            <i className="bi bi-receipt"></i> Order Summary
          </h2>

          {/* ✅ Cart Items List */}
          <div className="order-items-list">
            <div className="order-items-header">
              <span>{totalItems} {totalItems === 1 ? "Item" : "Items"}</span>
            </div>

            {/* Individual cart items */}
            {cart.items.map((item) => (
              <div key={item._id} className="order-item">
                <div className="order-item-image">
                  <img 
                    src={item.product?.image || "https://via.placeholder.com/50"} 
                    alt={item.product?.name || "Product"} 
                  />
                </div>
                <div className="order-item-details">
                  <div className="order-item-name">
                    {item.product?.name || "Product"}
                  </div>
                  <div className="order-item-meta">
                    <span className="order-item-qty">Qty: {item.quantity}</span>
                    <span className="order-item-price">
                      {formatPrice((item.product?.discountPrice || item.product?.price || 0) * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="summary-divider"></div>

          {/* Price breakdown */}
          <div className="summary-row">
            <span>Subtotal</span>
            <span>{formatPrice(cart.totalPrice)}</span>
          </div>

          <div className="summary-divider"></div>

          <div className="summary-row total-row">
            <span>Total Amount</span>
            <span>{formatPrice(cart.totalPrice)}</span>
          </div>

          <div className="checkout-secure-note">
            <i className="bi bi-shield-check"></i> Secure checkout
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Checkout;