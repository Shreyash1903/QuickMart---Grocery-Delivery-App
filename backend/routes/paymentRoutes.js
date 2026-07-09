import express from "express";
import verifyToken from "../middleware/authMiddleware.js";
import PaymentController from "../controllers/paymentController.js";

const router = express.Router();

// Protected Routes

// Create Razorpay Order
router.post("/create-order", verifyToken, PaymentController.createOrder);

// Verify Razorpay Payment
router.post("/verify", verifyToken, PaymentController.verifyPayment);

export default router;