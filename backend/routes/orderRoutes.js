import express from "express";
import verifyToken from "../middleware/authMiddleware.js";
import OrderController from "../controllers/orderController.js";

const router = express.Router();

router.use(verifyToken);

// Place an Order
router.post("/place", OrderController.placeOrder);

// Get My Orders
router.get("/", OrderController.getMyOrders);

// Get Order By ID
router.get("/:id", OrderController.getOrderById);

// Cancel Order
router.put("/cancel/:id", OrderController.cancelOrder);

export default router;