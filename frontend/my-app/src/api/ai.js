import API from "./axios";

// Search route for AI-powered product search
export const aiSearch = async (query) => {
  try {
    const response = await API.post("/api/ai/search", { query });
    return response.data;
  } catch (error) {
    console.error("❌ Error in AI search:", error);
    throw error;
  }
};
