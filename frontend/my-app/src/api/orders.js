import API from "./axios";

// Place an Order
export const placeOrder = async ({ addressId, paymentMethod }) => {
  try {
    const response = await API.post("/api/orders/place", {
      addressId,
      paymentMethod,
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error placing order:", error);
    throw error;
  }
};

// Get My Orders
export const getMyOrders = async () => {
  try {
    const response = await API.get("/api/orders");
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching orders:", error);
    throw error;
  }
};

// Get Order By ID
export const getOrderById = async (orderId) => {
  try {
    const response = await API.get(`/api/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching order:", error);
    throw error;
  }
};

// Cancel Order
export const cancelOrder = async (orderId) => {
  try {
    const response = await API.put(`/api/orders/cancel/${orderId}`);
    return response.data;
  } catch (error) {
    console.error("❌ Error cancelling order:", error);
    throw error;
  }
};
