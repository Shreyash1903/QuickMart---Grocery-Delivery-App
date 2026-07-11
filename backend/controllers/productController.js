import ProductModel from "../models/Product.js";
import mongoose from "mongoose";

class ProductController {
  // Add a new product 
  static addProduct = async (req, res) => {
    try {
      // new ProductModel(...) → Creates a new product document using the Product model.
      // req.body → Contains all the data sent from the frontend.
      const product = new ProductModel(req.body);
      await product.save(); // Saves the new product document to the database.

      // Sends HTTP status 201, which means Created Successfully.
      res.status(201).json({ // Sends data back to the frontend in JSON format.
        message: "Product Added Successfully", // Sends a success message to the frontend.
        product, // Shorthand for product: product, sends the newly created product data back to the frontend.
      }); // Closes the json() method.

      // If any error happens inside the try block (like a database error), execution comes here.
    } catch (error) {
      res.status(500).json({ // Sends HTTP status 500, which means Internal Server Error.
        message: "Error adding product", // Sends a custom error message.
        error: error.message,
      }); // Closes the JSON response.
    } // Ends the catch block.
  }; // Ends the addProduct function.

  // Get all products 
  static getallProducts = async (req, res) => {
    try {
      // ProductModel.find() - Retrieves all documents (products) from the MongoDB collection.
      const products = await ProductModel.find();

      // Sends HTTP status 200, meaning OK (Request Successful).
      res.status(200).json(products); // Sends all the products to the frontend in JSON format.
    } catch (error) {
      res.status(500).json({ // Sends HTTP status 500, meaning Internal Server Error.
        message: "Error fetching products", // Sends a custom error message to the frontend.
      });
    } // Ends the catch block.
  }; // Ends the getallProducts function.

  // Get Products by Category (fetch products of a specific category.)
  static getCategoryProducts = async (req, res) => {
    try {
      // Searches the MongoDB collection based on the given condition.
      const products = await ProductModel.find({
        category: req.params.category, // This is the search condition.
        // category → Field name in the MongoDB collection
        // req.params.category → Gets the category value from the URL.
        // req.params → Gets values from the URL path.
      }); // Closes the find() method

      // Sends the filtered products to the frontend in JSON format.
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ // Means Internal Server Error.
        message: "Error fetching category", // Sends a custom error message to the frontend.
      });
    }
  }; // Ends the getCategoryProducts function.

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
      // ProductModel.find() → Searches MongoDB.
      // Instead of returning all products, it returns only the products that match the search condition.
      const products = await ProductModel.find({
        name: { // Search inside the name field of every product.
          // MongoDB will search only inside the name column.
          $regex: req.query.search, // $regex means: Search for a pattern (text) instead of an exact value.
          // req.query.search reads the value of the search query parameter from the URL.
          // search → Parameter name
          // apple → Parameter value
          // Think of req.query as a bag containing all the values after ? in the URL.
          $options: "i", // Ignore uppercase and lowercase letters.
          // So "i" makes the search case-insensitive.
        }, // Ends the find() query.
      });

      // Sends the matching products to the frontend.
      res.json(products);
    } catch (error) {
      res.status(500).json({ // Sends a 500 Internal Server Error response.
        message: "Search error",
      });
    }
  };

  // Get single product by ID 
  static getProductById = async (req, res) => {
    try {
      // Validate ObjectId to avoid CastError from mongoose
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) { // Example : req.params.id = "687123abc456def789012345";
        return res.status(400).json({ message: "Invalid product id" });
        // 400 = Bad Request : Sent because the ID format itself is invalid
      }

      // Find the product by ID in the database
      const product = await ProductModel.findById(req.params.id);

      if (!product) { 
        return res.status(404).json({ message: "Product not found" });
      }

      // If the product is found, send it back to the frontend in JSON format.
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
      // Example : req.params.id = "687123abc456def789012345"
      // Searches the product using the given _id. and Deletes it from MongoDB.
      // req.params.id gets the product ID from the URL.
      await ProductModel.findByIdAndDelete(req.params.id);

      // Sends a success message back to the frontend in JSON format.
      res.json({
        message: "Product deleted", // Sends a success message to the frontend.
      });
    } catch (error) {
      res.status(500).json({
        message: "Delete failed", // Sends a custom error message to the frontend.
      });
    }
  };

}

export default ProductController;
