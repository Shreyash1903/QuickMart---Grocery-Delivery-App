import API from "./axios";

// Create Razorpay Order
export const createOrder = async (amount) => {
  try {
    const response = await API.post("/api/payment/create-order", { amount });
    return response.data;
  } catch (error) {
    console.error("❌ Error creating payment order:", error);
    throw error;
  }
};

// Verify Razorpay Payment
export const verifyPayment = async (paymentData) => {
  try {
    const response = await API.post("/api/payment/verify", paymentData);
    return response.data;
  } catch (error) {
    console.error("❌ Error verifying payment:", error);
    throw error;
  }
};
