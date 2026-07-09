import ProductModel from "../models/Product.js";
import mongoose from "mongoose";

class ProductController {
  // Add a new product 
  static addProduct = async (req, res) => {
    try {
      const product = new ProductModel(req.body);
      await product.save();

      res.status(201).json({
        message: "Product Added Successfully",
        product,
      });
    } catch (error) {
      res.status(500).json({
        message: "Error adding product",
        error: error.message,
      });
    }
  };

  // Get all products 
  static getallProducts = async (req, res) => {
    try {
      const products = await ProductModel.find();

      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({
        message: "Error fetching products",
      });
    }
  };

  // Get Products by Category 
  static getCategoryProducts = async (req, res) => {
    try {
      const products = await ProductModel.find({
        category: req.params.category,
      });

      res.json(products);
    } catch (error) {
      res.status(500).json({
        message: "Error fetching category",
      });
    }
  };

  // Search Suggestions (Autocomplete)
  static searchSuggestions = async (req, res) => {
    try {
      const query = req.query.q || req.query.search || '';
      
      // Agar query empty hai ya 2 characters se kam hai toh empty array return karein
      if (!query || query.length < 2) {
        return res.json([]);
      }

      // Database mein search karein
      const suggestions = await ProductModel.find({
        name: {
          $regex: query,
          $options: "i" // Case-insensitive
        }
      })
      .select("name category price image discountPrice description") // Sirf required fields
      .limit(10); // Sirf 10 results

      res.status(200).json(suggestions);
      
    } catch (error) {
      console.error("Search suggestions error:", error);
      res.status(500).json({
        message: "Error fetching suggestions",
        error: error.message
      });
    }
  };

  // Search Products 
  static searchProducts = async (req, res) => {
    try {
      const products = await ProductModel.find({
        name: {
          $regex: req.query.search,
          $options: "i",
        },
      });

      res.json(products);
    } catch (error) {
      res.status(500).json({
        message: "Search error",
      });
    }
  };

  // Get single product by ID 
  static getProductById = async (req, res) => {
    try {
      // Validate ObjectId to avoid CastError from mongoose
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: "Invalid product id" });
      }
      const product = await ProductModel.findById(req.params.id);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.status(200).json(product);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error fetching product", error: error.message });
    }
  };

  // Delete a product
  static deleteProduct = async (req, res) => {
    try {
      await ProductModel.findByIdAndDelete(req.params.id);

      res.json({
        message: "Product deleted",
      });
    } catch (error) {
      res.status(500).json({
        message: "Delete failed",
      });
    }
  };

}

export default ProductController;
