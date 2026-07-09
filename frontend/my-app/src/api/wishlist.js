import API from "./axios";

// Add a product to the wishlist
export const addToWishlist = async (productId) => {
  try {
    const response = await API.post("/api/wishlist", { productId });
    return response.data;
  } catch (error) {
    console.error("❌ Error adding to wishlist:", error);
    throw error;
  }
};

// Get the wishlist for the logged-in user
export const getWishlist = async () => {
  try {
    const response = await API.get("/api/wishlist");
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching wishlist:", error);
    throw error;
  }
};

// Remove a product from the wishlist
export const removeFromWishlist = async (productId) => {
  try {
    const response = await API.delete(`/api/wishlist/${productId}`);
    return response.data;
  } catch (error) {
    console.error("❌ Error removing from wishlist:", error);
    throw error;
  }
};

// Check if a product is in the wishlist
export const checkWishlist = async (productId) => {
  try {
    const response = await API.get(`/api/wishlist/check/${productId}`);
    return response.data;
  } catch (error) {
    console.error("❌ Error checking wishlist:", error);
    throw error;
  }
};

// Get wishlist count
export const getWishlistCount = async () => {
  try {
    const response = await API.get("/api/wishlist/count");
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching wishlist count:", error);
    throw error;
  }
};
