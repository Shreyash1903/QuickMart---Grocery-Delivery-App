// Load environment variables from .env file
import "dotenv/config";
import express from "express"; // Importing the Express module using ES6 syntax
import cors from "cors"; // Importing the CORS module to handle Cross-Origin Resource Sharing
import session from "express-session"; // Importing the express-session module to manage user sessions
import connectDB from "./db/connectdb.js"; // Importing the function to connect to the database
import webRoutes from "./routes/web.js"; // Importing the web routes
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import addressRoutes from "./routes/addressRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express(); // Creating an instance of the Express application
const port = process.env.PORT || 3000; // Setting the port for the server
const DATABASE_URL = process.env.DATABASE_URL || "mongodb://localhost:27017"; // MongoDB connection URL

// Log the database URL to verify it is loaded correctly
// console.log(process.env.DATABASE_URL);

// Log Razorpay credentials to verify they are loaded correctly
// console.log("Razorpay Key:", process.env.RAZORPAY_KEY_ID);
// console.log("Razorpay Secret:", process.env.RAZORPAY_KEY_SECRET ? "Loaded" : "Not Loaded");

// Database connection
connectDB(DATABASE_URL); // Calling the function to connect to the database with the specified URL

// ✅ CORS configuration (VERY IMPORTANT for React + Sessions)
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://quick-mart-grocery-delivery-app.vercel.app",
  "https://quick-mart-grocery-delivery-lnrc17abt.vercel.app",
  /\.vercel\.app$/,  // ✅ All vercel.app URLs allowed
  "https://quickmart-admin-topaz.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log("❌ Blocked by CORS:", origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true, // allow cookies/session
  })
);

// Session middleware
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false, // better practice
    cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 }, // 24 hours
  }),
);

// Middleware to parse URL-encoded data from the request body
app.use(express.json()); // Middleware to parse JSON data from the request body

// Load the User Routes
app.use("/", webRoutes); // Using the imported web routes for the root path

// Load the Product Routes
app.use("/api/products", productRoutes);

// Load the Cart Routes
app.use("/api/cart", cartRoutes);

// Load the Address Routes
app.use("/api/address", addressRoutes);

// Load the Order Routes
app.use("/api/orders", orderRoutes);

// Load the Payment Routes
app.use("/api/payment", paymentRoutes);

// Load the Wishlist Routes
app.use("/api/wishlist", wishlistRoutes);

// Load the AI Routes
app.use("/api/ai", aiRoutes);

// Load the Admin Routes
app.use("/api/admin", adminRoutes);

// Starting the server and logging a message to the console
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});