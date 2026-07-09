import express from "express";
import WishlistController from "../controllers/wishlistController.js";
import verifyToken from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ SPECIFIC ROUTES FIRST (before :productId)

// Add a product to the wishlist
router.post("/", verifyToken, WishlistController.addToWishlist);

// Get wishlist count
router.get("/count", verifyToken, WishlistController.getWishlistCount);

// Check if a product is in the wishlist
router.get("/check/:productId", verifyToken, WishlistController.checkWishlist);

// ✅ GENERIC ROUTES AFTER specific ones

// Get the wishlist for the logged-in user
router.get("/", verifyToken, WishlistController.getWishlist);

// Remove a product from the wishlist
router.delete("/:productId",verifyToken,WishlistController.removeFromWishlist);

export default router;
