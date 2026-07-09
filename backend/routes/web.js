// 👉 Import Express framework
import express from "express";

// 👉 Create router object
const router = express.Router(); // 👉 Used to define routes

// 👉 Import controller functions
import UserController from "../controllers/userController.js";
import HomeController from "../controllers/homeController.js";

// 👉 Middleware for protected routes (JWT check)
import verifyToken from "../middleware/authMiddleware.js"; // ✅ JWT middleware

// ================= PUBLIC ROUTES =================

// Register User
router.post("/registration", UserController.createUser);

// Login User
router.post("/login", UserController.verifyUser);

// Forgot Password
router.post("/forgot-password", UserController.userForgotPassword);

// Verify OTP for password reset
router.post("/verify-otp", UserController.verifyResetOtp);

// Reset Password using OTP
router.post("/reset-password", UserController.userResetPassword);

// Public home data
router.get("/home", HomeController.getHome);

// Google Login
// router.post("/google-login", UserController.googleLogin);

// ================= PROTECTED ROUTES =================

// Current user (Protected)
router.get("/me", verifyToken, UserController.me);

// Profile route (Protected)
router.put("/profile",verifyToken,UserController.updateProfile);

// Change Password route (Protected)
router.put("/change-password",verifyToken,UserController.changePassword);

export default router; // 👉 Export router object
