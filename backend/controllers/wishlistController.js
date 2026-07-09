import Wishlist from "../models/Wishlist.js";

class WishlistController {
  // Add Product to Wishlist
  static addToWishlist = async (req, res) => {
    try {
      const { productId } = req.body;

      const exists = await Wishlist.findOne({
        user: req.user.userId,
        product: productId,
      });

      if (exists) {
        return res.status(400).json({
          success: false,
          message: "Product already in wishlist",
        });
      }

      const wishlist = await Wishlist.create({
        user: req.user.userId,
        product: productId,
      });

      res.status(201).json({
        success: true,
        message: "Added to wishlist",
        wishlist,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

  // Get Wishlist
  static getWishlist = async (req, res) => {
    try {
      console.log("📦 Fetching wishlist for user:", req.user.userId);

      const wishlist = await Wishlist.find({
        user: req.user.userId,
      }).populate("product");

      console.log("✅ Wishlist items found:", wishlist.length);
      console.log("📋 Items:", JSON.stringify(wishlist, null, 2));

      res.status(200).json({
        success: true,
        wishlist,
      });
    } catch (error) {
      console.error("❌ Error fetching wishlist:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

  // Remove Product
  static removeFromWishlist = async (req, res) => {
    try {
      await Wishlist.findOneAndDelete({
        user: req.user.userId,
        product: req.params.productId,
      });

      res.status(200).json({
        success: true,
        message: "Removed from wishlist",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

  // Check Wishlist
  static checkWishlist = async (req, res) => {
    try {
      const wishlist = await Wishlist.findOne({
        user: req.user.userId,
        product: req.params.productId,
      });

      res.status(200).json({
        success: true,
        isWishlisted: !!wishlist,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

  // Get wishlist count
  static getWishlistCount = async (req, res) => {
    try {
      const wishlistItems = await Wishlist.find({ user: req.user.userId });

      res.status(200).json({ count: wishlistItems.length });
    } catch (error) {
      console.error("Error fetching wishlist count:", error);
      res.status(500).json({ message: "Error fetching wishlist count" });
    }
  };
}

export default WishlistController;
