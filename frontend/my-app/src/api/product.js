import API from "./axios";

// Add a New Product
export const addProduct = async (productData) => {
  try {
    const response = await API.post("/api/products/add", productData);
    return response.data;
  } catch (error) {
    console.error("❌ Error adding product:", error);
    throw error;
  }
};

// Get All Products
export const getallProducts = async () => {
  try {
    const response = await API.get("/api/products");
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    throw error;
  }
};

// Get Products by Category
export const getCategoryProducts = async (category) => {
  try {
    const response = await API.get(
      `/api/products/category/${encodeURIComponent(category)}`
    );
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching category products:", error);
    throw error;
  }
};

// Get Single Product by ID 
export const getProductById = async (id) => {
  try {
    const response = await API.get(`/api/products/${id}`);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching product:", error);
    throw error;
  }
};

// Search Products ( Full Search )
export const searchProducts = async (search) => {
  try {
    const response = await API.get(`/api/products/search`, { 
      params: { search } 
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error searching products:", error);
    throw error;
  }
};

// Search Suggestions (Autocomplete)
export const searchSuggestions = async (query) => {
  try {
    const response = await API.get(`/api/products/search/suggestions`, { 
      params: { q: query } 
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching suggestions:", error);
    throw error;
  }
};

// Delete a Product
export const deleteProduct = async (id) => {
  try {
    const response = await API.delete(`/api/products/${id}`);
    return response.data;
  } catch (error) {
    console.error("❌ Error deleting product:", error);
    throw error;
  }
};

