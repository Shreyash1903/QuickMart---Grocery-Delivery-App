import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAddresses } from "../api/address";
import { getCart, notifyCartUpdated } from "../api/cart";
import { placeOrder } from "../api/orders";
import { createOrder, verifyPayment } from "../api/payment";
import { toast } from "react-toastify";
import "./checkout.css";

const formatPrice = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

function Checkout() {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [cart, setCart] = useState({ items: [], totalPrice: 0 });
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

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

  useEffect(() => {
    loadCheckoutData();
  }, []);

  const totalItems = useMemo(
    () => cart.items.reduce((total, item) => total + item.quantity, 0),
    [cart.items],
  );

  const finalizeOrder = async (selectedPaymentMethod) => {
    await placeOrder({
      addressId: selectedAddressId,
      paymentMethod: selectedPaymentMethod,
    });

    notifyCartUpdated();
    
    // ✅ Success Toast
    toast.success("🎉 Order placed successfully!", {
      position: "top-right",
      autoClose: 4000,
    });
    
    navigate("/orders", { replace: true });
  };

  const handleOnlinePayment = async () => {
    const scriptLoaded = await loadRazorpayScript();

    if (!scriptLoaded) {
      const errorMsg = "Razorpay SDK failed to load. Please try again.";
      setError(errorMsg);
      toast.error(`❌ ${errorMsg}`, {
        position: "top-right",
        autoClose: 4000,
      });
      return;
    }

    if (!process.env.REACT_APP_RAZORPAY_KEY_ID) {
      const errorMsg = "Razorpay key is not configured in the frontend environment.";
      setError(errorMsg);
      toast.error(`❌ ${errorMsg}`, {
        position: "top-right",
        autoClose: 4000,
      });
      return;
    }

    const amountInRupees = cart.totalPrice || 0;

    try {
      setSubmitting(true);
      setError("");

      const orderData = await createOrder(amountInRupees);

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "Login Registration Authentication",
        description: "Online order payment",
        order_id: orderData.order.id,
        handler: async (response) => {
          try {
            await verifyPayment(response);

            await finalizeOrder("Online", {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
            });
          } catch (verifyError) {
            const errorMsg = verifyError.response?.data?.message || "Payment verification failed";
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

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", () => {
        const errorMsg = "Payment failed. Please try again.";
        setError(errorMsg);
        toast.error(`❌ ${errorMsg}`, {
          position: "top-right",
          autoClose: 4000,
        });
        setSubmitting(false);
      });
      razorpay.open();
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

    if (paymentMethod === "Online") {
      await handleOnlinePayment();
      return;
    }

    try {
      setSubmitting(true);
      setError("");

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
    navigate(`/address?edit=${addressId}`);
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
            <div className="checkout-empty-inline">
              <p>No saved addresses found.</p>
              <button
                type="button"
                className="checkout-secondary-btn"
                onClick={() => navigate("/address")}
              >
                Add Address
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
                    <span className="address-mobile">{address.mobileNumber}</span>
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

        <aside className="checkout-summary-card">
          <h2>
            <i className="bi bi-receipt"></i> Order Summary
          </h2>

          <div className="summary-row">
            <span>Total Items</span>
            <span>{totalItems}</span>
          </div>

          <div className="summary-row">
            <span>Products</span>
            <span>{cart.items.length}</span>
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