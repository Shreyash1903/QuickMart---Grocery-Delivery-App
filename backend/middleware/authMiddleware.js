// JWT Token Verification Middleware
import jwt from "jsonwebtoken";

// Load environment variables from .env file
import "dotenv/config";

// Load JWT Secret from .env
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to verify JWT token in protected routes
// Ye middleware check karta hai ki user valid JWT token ke saath request bhej raha hai ya nahi.
const verifyToken = (req, res, next) => {
  try {
    // Get Authorization Header
    const authHeader = req.headers.authorization;
    // console.log(req.headers);
    // console.log(authHeader);

    // Check if Authorization header exists
    if (!authHeader) {
      return res.status(401).json({
        message: "No token provided",
      });
    }

    // Check if token starts with "Bearer "
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Invalid authorization format",
      });
    }

    // Extract token
    // Bearer eyJhbGc.ABC.XYZ Split hoga
    const token = authHeader.split(" ")[1];

    // Verify JWT
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Log the decoded token for debugging
    console.log(decoded);
    
    req.user = decoded;

    // Continue to next middleware
    next();

  } catch (error) {

    // Token Expired
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token has expired",
      });
    }

    // Invalid Token
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        message: "Invalid token",
      });
    }

    // Any Other Error
    return res.status(500).json({
      message: "Authentication failed",
    });
  }
};

export default verifyToken;