import express from "express";
import AdminController from "../controllers/AdminController.js";
import UserController from "../controllers/userController.js";
import verifyToken from "../middleware/authMiddleware.js";
import adminAuth from "../middleware/adminAuth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// Login route for admin
router.post("/login", UserController.verifyUser);

// Dashboard Data
router.get("/dashboard", AdminController.dashboard);

// Admin profile routes
router.get("/profile", verifyToken, adminAuth, AdminController.getAdminProfile);
router.put(
  "/profile",
  verifyToken,
  adminAuth,
  AdminController.updateAdminProfile,
);
router.put(
  "/profile/password",
  verifyToken,
  adminAuth,
  AdminController.changeAdminPassword,
);
// ===== PRODUCT ROUTES=====

// ✅ SPECIFIC ROUTES PEHLE (Search, Suggestions)
// Search Products
router.get(
  "/products/search",
  verifyToken,
  adminAuth,
  AdminController.searchProducts,
);

// Get Products Search Suggestions (Autocomplete)
router.get(
  "/products/suggestions",
  verifyToken,
  adminAuth,
  AdminController.getSearchSuggestions,
);

// Get All Products
router.get("/products", verifyToken, adminAuth, AdminController.getAllProducts);

// ✅ DYNAMIC ROUTES BAAD MEIN (/:id wale)
// Get Single Product (for View)
router.get(
  "/products/:id",
  verifyToken,
  adminAuth,
  AdminController.getProductById,
);

// Add Product
router.post(
  "/products",
  verifyToken,
  adminAuth,
  upload.single("image"),
  AdminController.addProduct,
);

// Update Product
router.put(
  "/products/:id",
  verifyToken,
  adminAuth,
  AdminController.updateProduct,
);

// Delete Product
router.delete(
  "/products/:id",
  verifyToken,
  adminAuth,
  AdminController.deleteProduct,
);

// Get Categories of Products
router.get(
  "/categories",
  verifyToken,
  adminAuth,
  AdminController.getCategories,
);

// ===== USER ROUTES =====

// Get All Users
router.get("/users", verifyToken, adminAuth, AdminController.getAllUsers);

// Get Single User by ID
router.get("/users/:id", verifyToken, adminAuth, AdminController.getUserById);

// Update User by ID
router.put("/users/:id", verifyToken, adminAuth, AdminController.updateUser);

// Delete User by ID
router.delete("/users/:id", verifyToken, adminAuth, AdminController.deleteUser);

// ===== ORDER ROUTES =====

// GET orders with search
router.get(
  "/orders/search",
  verifyToken,
  adminAuth,
  AdminController.searchOrders,
);

// Get All Orders
router.get("/orders", verifyToken, adminAuth, AdminController.getAllOrders);

// Get Single Order by ID
router.get("/orders/:id", verifyToken, adminAuth, AdminController.getOrderById);

// Update Order Status
router.put(
  "/orders/:id/status",
  verifyToken,
  adminAuth,
  AdminController.updateOrderStatus,
);

// Delete Order by ID
router.delete(
  "/orders/:id",
  verifyToken,
  adminAuth,
  AdminController.deleteOrder,
);

export default router;
