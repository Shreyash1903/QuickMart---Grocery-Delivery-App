import express from "express";
import AIController from "../controllers/aiController.js";

const router = express.Router();

// Search route for AI-powered product search
router.post("/search", AIController.aiSearch);

export default router;