import API from "./axios";

export const CART_UPDATED_EVENT = "cart-updated";

export const notifyCartUpdated = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CART_UPDATED_EVENT));
  }
};

// Add to Cart
export const addToCart = async (productId) => {
  try {
    const response = await API.post("/api/cart/add", { productId });
    notifyCartUpdated();
    return response.data;
  } catch (error) {
    console.error("❌ Error adding to cart:", error);
    throw error;
  }
};

// Get all Cart Items
export const getCart = async () => {
  try {
    const response = await API.get("/api/cart");
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching cart:", error);
    throw error;
  }
};

// Update Cart Quantity
export const updateQuantity = async (productId, quantity) => {
  try {
    const response = await API.put(`/api/cart/update/${productId}`, {
      quantity,
    });
    notifyCartUpdated();
    return response.data;
  } catch (error) {
    console.error("❌ Error updating quantity:", error);
    throw error;
  }
};

// Remove Item from Cart
export const removeItem = async (productId) => {
  try {
    const response = await API.delete(`/api/cart/remove/${productId}`);
    notifyCartUpdated();
    return response.data;
  } catch (error) {
    console.error("❌ Error removing item:", error);
    throw error;
  }
};

// Clear Cart
export const clearCart = async () => {
  try {
    const response = await API.delete("/api/cart/clear");
    notifyCartUpdated();
    return response.data;
  } catch (error) {
    console.error("❌ Error clearing cart:", error);
    throw error;
  }
};
