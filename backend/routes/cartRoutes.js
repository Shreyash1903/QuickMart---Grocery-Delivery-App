import express from "express";
import CartController from "../controllers/cartController.js";
import verifyToken from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(verifyToken);

// Add to Cart
router.post("/add", CartController.addToCart);

// Get all Cart Items
router.get("/", CartController.getCart);

// Update Cart Quantity
router.put("/update/:productId", CartController.updateQuantity);

// Remove Item from Cart
router.delete("/remove/:productId", CartController.removeItem);

// Clear Cart
router.delete("/clear", CartController.clearCart);

export default router;
