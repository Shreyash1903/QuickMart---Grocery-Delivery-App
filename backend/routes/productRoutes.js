// 👉 Import Express framework
import express from "express";

// 👉 Create router object
const router = express.Router();

// 👉 Import controller functions
import ProductController from "../controllers/productController.js";

// PRODUCT ROUTES 

// Add a New Product 
router.post("/add", ProductController.addProduct);
 
// Get All Products
router.get("/", ProductController.getallProducts);

// Get Products by Category 
router.get("/category/:category", ProductController.getCategoryProducts);

// Search Products ( Full Search )
router.get("/search", ProductController.searchProducts);

// Search Suggestions (Autocomplete)
router.get("/search/suggestions", ProductController.searchSuggestions);

// Get Single Product by ID 
router.get("/:id", ProductController.getProductById);

// Delete a Product
router.delete("/:id", ProductController.deleteProduct);

export default router;
