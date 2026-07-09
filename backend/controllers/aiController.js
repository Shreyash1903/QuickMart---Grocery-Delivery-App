import ProductModel from "../models/Product.js";
import { askGemini } from "../services/geminiService.js";

class AIController {
  // Search route for AI-powered product search
  static aiSearch = async (req, res) => {
    try {
      const { query } = req.body;

      if (!query) {
        return res.status(400).json({
          message: "Query is required",
        });
      }

      // Fetch all available categories
      const categories = await ProductModel.distinct("category");

      // Ask Gemini
      const filters = await askGemini(query, categories);

      console.log("Gemini Filters:", filters);

      let mongoQuery = {};

      // Category Filter
      if (filters.category && filters.category !== "") {
        mongoQuery.category = {
          $regex: `^${filters.category}$`,
          $options: "i",
        };
      }

      // Price Filter
      if (filters.maxPrice && filters.maxPrice > 0) {
        mongoQuery.discountPrice = {
          $lte: filters.maxPrice,
        };
      }

      // If Gemini couldn't detect category,
      // then use keywords
      if (
        (!filters.category || filters.category === "") &&
        filters.keywords &&
        filters.keywords.length > 0
      ) {
        mongoQuery.$or = [];

        filters.keywords.forEach((keyword) => {
          mongoQuery.$or.push({
            name: {
              $regex: keyword,
              $options: "i",
            },
          });

          mongoQuery.$or.push({
            description: {
              $regex: keyword,
              $options: "i",
            },
          });

          mongoQuery.$or.push({
            category: {
              $regex: keyword,
              $options: "i",
            },
          });
        });
      }

      console.log("Mongo Query:", mongoQuery);

      const products = await ProductModel.find(mongoQuery);

      res.status(200).json({
        filters,
        totalProducts: products.length,
        products,
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message: "AI Search Failed",
        error: error.message,
      });
    }
  };
}

export default AIController;