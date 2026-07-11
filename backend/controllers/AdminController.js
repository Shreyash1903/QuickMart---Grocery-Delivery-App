import UserModel from "../models/User.js";
import ProductModel from "../models/Product.js";
import OrderModel from "../models/Order.js";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

class AdminController {
  // Dashboard Data
  static dashboard = async (req, res) => {
    try {
      // Total Users
      const totalUsers = await UserModel.countDocuments();

      // Total Products
      const totalProducts = await ProductModel.countDocuments();

      // Total Orders
      const totalOrders = await OrderModel.countDocuments();

      // Revenue
      const orders = await OrderModel.find();

      let totalRevenue = 0;

      orders.forEach((order) => {
        totalRevenue += order.totalAmount || 0;
      });

      res.status(200).json({
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue,
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message: "Error fetching dashboard",
      });
    }
  };

  // PRODUCT ROUTES

  // Get All Products
  static getAllProducts = async (req, res) => {
    try {
      const products = await ProductModel.find().sort({
        createdAt: -1,
      });

      res.status(200).json({
        totalProducts: products.length,
        products,
      });
    } catch (error) {
      res.status(500).json({
        message: "Error fetching products",
      });
    }
  };

  // Get Single Product (for View)
  static getProductById = async (req, res) => {
    try {
      const { id } = req.params;

      const product = await ProductModel.findById(id);

      if (!product) {
        return res.status(404).json({
          message: "Product not found",
        });
      }

      res.status(200).json({
        product,
      });
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({
        message: "Error fetching product",
      });
    }
  };

  // Search Products
  static searchProducts = async (req, res) => {
    try {
      const {
        q,
        category,
        minPrice,
        maxPrice,
        inStock,
        limit = 20,
      } = req.query;

      console.log("🔍 Search Params:", {
        q,
        category,
        minPrice,
        maxPrice,
        inStock,
      });

      let filter = {};

      // ✅ Search by name (if q parameter exists)
      if (q && q.trim()) {
        filter.name = { $regex: q.trim(), $options: "i" };
      }

      // ✅ Category filter
      if (category && category !== "all" && category !== "") {
        filter.category = category;
      }

      // ✅ Price range filter
      if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = Number(minPrice);
        if (maxPrice) filter.price.$lte = Number(maxPrice);
      }

      // ✅ In Stock filter
      if (inStock === "true") {
        filter.stock = { $gt: 0 };
      }

      // ✅ Execute query - Category only search will work now
      const products = await ProductModel.find(filter)
        .sort({ createdAt: -1 })
        .limit(Number(limit));

      console.log(`📦 Found ${products.length} products`);

      res.status(200).json({
        totalProducts: products.length,
        products,
        searchTerm: q?.trim() || "",
        appliedFilters: { category, minPrice, maxPrice, inStock },
      });
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({
        message: "Error searching products",
        error: error.message,
      });
    }
  };

  // Get Products Search Suggestions (Autocomplete)
  static getSearchSuggestions = async (req, res) => {
    try {
      const { q, limit = 8 } = req.query;

      if (!q || !q.trim() || q.trim().length < 1) {
        return res.status(200).json({
          suggestions: [],
        });
      }

      // Search for products matching the query
      const products = await ProductModel.find({
        name: { $regex: q.trim(), $options: "i" },
      })
        .select("name category image price discountPrice")
        .limit(Number(limit))
        .sort({ name: 1 });

      // Format suggestions
      const suggestions = products.map((product) => ({
        id: product._id,
        name: product.name,
        category: product.category,
        image: product.image,
        price: product.price,
        discountPrice: product.discountPrice,
      }));

      res.status(200).json({
        suggestions,
        total: suggestions.length,
        query: q.trim(),
      });
    } catch (error) {
      console.error("Suggestion error:", error);
      res.status(500).json({
        message: "Error fetching suggestions",
      });
    }
  };

  // Add Product
  static addProduct = async (req, res) => {
    try {
      console.log("📦 Adding product...");
      console.log("📝 Body:", req.body);
      console.log("📎 File:", req.file);

      // ✅ Check if file was uploaded successfully
      let image = "https://via.placeholder.com/600x600?text=No+Image";

      if (req.file) {
        // ✅ Cloudinary returns file path in req.file.path
        image = req.file.path;
        console.log("✅ Image uploaded to Cloudinary:", image);
      } else if (req.body.image) {
        image = req.body.image;
      }

      // ✅ Process form data
      const quantity = req.body.quantity?.trim() || "1 unit";
      const stock = Number(req.body.stock) || 0;
      const price = Number(req.body.price);
      const discountPrice = Number(req.body.discountPrice) || 0;
      const isNew = req.body.isNew === "true" || req.body.isNew === true;

      // ✅ Validate required fields
      if (!req.body.name) {
        return res.status(400).json({
          message: "Product name is required",
        });
      }

      if (!req.body.category) {
        return res.status(400).json({
          message: "Category is required",
        });
      }

      if (!price || price <= 0) {
        return res.status(400).json({
          message: "Valid price is required",
        });
      }

      // ✅ Create product
      const product = new ProductModel({
        name: req.body.name,
        category: req.body.category,
        description: req.body.description || "",
        price: price,
        discountPrice: discountPrice,
        quantity: quantity,
        stock: stock,
        image: image,
        isNew: isNew,
      });

      await product.save();

      console.log("✅ Product saved successfully:", product._id);

      res.status(201).json({
        success: true,
        message: "Product added successfully",
        product,
      });
    } catch (error) {
      console.error("❌ Error adding product:", error);

      // ✅ Check if it's a Cloudinary error
      if (error.message.includes("Cloudinary")) {
        return res.status(500).json({
          message: "Image upload failed. Please try again.",
          error: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Error adding product",
        error: error.message,
      });
    }
  };

  // Update Product
  static updateProduct = async (req, res) => {
    try {
      const { id } = req.params;

      const product = await ProductModel.findByIdAndUpdate(id, req.body, {
        new: true,
      });

      if (!product) {
        return res.status(404).json({
          message: "Product not found",
        });
      }

      res.status(200).json({
        message: "Product updated successfully",
        product,
      });
    } catch (error) {
      res.status(500).json({
        message: "Error updating product",
      });
    }
  };

  // Delete Product
  static deleteProduct = async (req, res) => {
    try {
      const { id } = req.params;
      const product = await ProductModel.findByIdAndDelete(id);

      if (!product) {
        return res.status(404).json({
          message: "Product not found",
        });
      }

      res.status(200).json({
        message: "Product deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        message: "Error deleting product",
      });
    }
  };

  // Get Categories of Products
  static getCategories = async (req, res) => {
    try {
      const categories = await ProductModel.distinct("category");
      res.status(200).json({
        categories: categories.filter((cat) => cat && cat.trim()),
      });
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({
        message: "Error fetching categories",
      });
    }
  };

  // USERS ROUTES

  // Get All Users
  static getAllUsers = async (req, res) => {
    try {
      const {
        search,
        role,
        sort = "createdAt",
        page = 1,
        limit = 20,
      } = req.query;

      // Build filter
      let filter = {};

      // Search by name or email
      if (search && search.trim()) {
        filter.$or = [
          { name: { $regex: search.trim(), $options: "i" } },
          { email: { $regex: search.trim(), $options: "i" } },
        ];
      }

      // Filter by role
      if (role && role !== "all") {
        filter.role = role;
      }

      // Pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const sortOrder = sort === "createdAt" ? -1 : 1;

      const users = await UserModel.find(filter)
        .select("-password -resetOTP -resetOTPExpire")
        .sort({ [sort]: sortOrder })
        .skip(skip)
        .limit(parseInt(limit));

      const totalUsers = await UserModel.countDocuments(filter);

      res.status(200).json({
        users,
        totalUsers,
        totalPages: Math.ceil(totalUsers / parseInt(limit)),
        currentPage: parseInt(page),
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({
        message: "Error fetching users",
      });
    }
  };

  // Get Single User by ID
  static getUserById = async (req, res) => {
    try {
      const { id } = req.params;

      const user = await UserModel.findById(id).select(
        "-password -resetOTP -resetOTPExpire",
      );

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      res.status(200).json({
        user,
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({
        message: "Error fetching user",
      });
    }
  };

  // Update User by ID
  static updateUser = async (req, res) => {
    try {
      const { id } = req.params;
      const { name, role, isActive } = req.body;

      const user = await UserModel.findByIdAndUpdate(
        id,
        { name, role, isActive },
        { new: true },
      ).select("-password -resetOTP -resetOTPExpire");

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      res.status(200).json({
        message: "User updated successfully",
        user,
      });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({
        message: "Error updating user",
      });
    }
  };

  // Delete User by ID
  static deleteUser = async (req, res) => {
    try {
      const { id } = req.params;

      const user = await UserModel.findByIdAndDelete(id);

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      res.status(200).json({
        message: "User deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({
        message: "Error deleting user",
      });
    }
  };

  // ORDERS ROUTES

  // Get All Orders
  static getAllOrders = async (req, res) => {
    try {
      const { status, startDate, endDate, page = 1, limit = 10 } = req.query;

      console.log("📋 GetAllOrders - Params:", {
        status,
        startDate,
        endDate,
        page,
        limit,
      });

      let filter = {};

      // 📌 Status filter
      if (status && status !== "all") {
        filter.orderStatus = status;
      }

      // � Filter by user ID (when viewing a specific user's orders)
      if (req.query.userId) {
        filter.user = req.query.userId;
      }

      // �📅 Date range filter
      if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) {
          filter.createdAt.$gte = new Date(startDate);
        }
        if (endDate) {
          const endDateTime = new Date(endDate);
          endDateTime.setHours(23, 59, 59, 999);
          filter.createdAt.$lte = endDateTime;
        }
      }

      console.log("🔍 GetAllOrders - Filter:", JSON.stringify(filter, null, 2));

      // 📊 Pagination
      const skip = (Number(page) - 1) * Number(limit);
      const limitNum = Number(limit);

      // 📊 Get total count
      const totalOrders = await OrderModel.countDocuments(filter);

      // 📊 Get orders with pagination
      let orders = await OrderModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

      // 📌 Populate address and user
      const populatedOrders = await Promise.all(
        orders.map(async (order) => {
          const orderObj = order.toObject();

          if (order.user) {
            try {
              const user = await UserModel.findById(order.user).select(
                "name email",
              );
              orderObj.user = user;
            } catch (err) {
              orderObj.user = null;
            }
          }

          if (order.address) {
            try {
              const AddressModel = mongoose.model("Address");
              const address = await AddressModel.findById(order.address);
              orderObj.address = address;
            } catch (err) {
              orderObj.address = null;
            }
          }

          return orderObj;
        }),
      );

      // 📊 Calculate stats
      const stats = await OrderModel.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$totalAmount" },
            avgOrder: { $avg: "$totalAmount" },
            count: { $sum: 1 },
          },
        },
      ]);

      const totalPages = Math.ceil(totalOrders / limitNum);

      res.status(200).json({
        success: true,
        orders: populatedOrders,
        totalOrders: totalOrders,
        totalPages: totalPages,
        currentPage: Number(page),
        stats: {
          totalRevenue: stats[0]?.totalRevenue || 0,
          averageOrderValue: stats[0]?.avgOrder || 0,
          totalOrders: stats[0]?.count || 0,
        },
      });
    } catch (error) {
      console.error("❌ GetAllOrders Error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching orders",
        error: error.message,
      });
    }
  };

  // GET orders with search
  static searchOrders = async (req, res) => {
    try {
      const { search, page = 1, limit = 10 } = req.query;

      console.log("🔍 SearchOrders - Params:", { search, page, limit });

      let filter = {};

      // 🔎 SEARCH - REQUIRED field
      if (!search || !search.trim()) {
        return res.status(400).json({
          success: false,
          message: "Search term is required",
        });
      }

      const searchTerm = search.trim().replace("#", "");
      const regex = new RegExp(searchTerm, "i");

      // ✅ SIRF CUSTOMER NAME SE SEARCH
      filter.$or = [{ "address.fullName": regex }];

      console.log("🔍 SearchOrders - Filter:", JSON.stringify(filter, null, 2));

      // 📊 Pagination
      const skip = (Number(page) - 1) * Number(limit);
      const limitNum = Number(limit);

      // 📊 Get total count
      const totalOrders = await OrderModel.countDocuments(filter);

      // 📊 Get orders with pagination
      let orders = await OrderModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

      // 📌 Populate address and user
      const populatedOrders = await Promise.all(
        orders.map(async (order) => {
          const orderObj = order.toObject();

          if (order.user) {
            try {
              const user = await UserModel.findById(order.user).select(
                "name email",
              );
              orderObj.user = user;
            } catch (err) {
              orderObj.user = null;
            }
          }

          if (order.address) {
            try {
              const AddressModel = mongoose.model("Address");
              const address = await AddressModel.findById(order.address);
              orderObj.address = address;
            } catch (err) {
              orderObj.address = null;
            }
          }

          return orderObj;
        }),
      );

      // 📊 Calculate stats
      const stats = await OrderModel.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$totalAmount" },
            avgOrder: { $avg: "$totalAmount" },
            count: { $sum: 1 },
          },
        },
      ]);

      const totalPages = Math.ceil(totalOrders / limitNum);

      res.status(200).json({
        success: true,
        orders: populatedOrders,
        totalOrders: totalOrders,
        totalPages: totalPages,
        currentPage: Number(page),
        searchTerm: search.trim(),
        stats: {
          totalRevenue: stats[0]?.totalRevenue || 0,
          averageOrderValue: stats[0]?.avgOrder || 0,
          totalOrders: stats[0]?.count || 0,
        },
      });
    } catch (error) {
      console.error("❌ SearchOrders Error:", error);
      res.status(500).json({
        success: false,
        message: "Error searching orders",
        error: error.message,
      });
    }
  };

  // Get Single Order by ID
  static getOrderById = async (req, res) => {
    try {
      const { id } = req.params;

      const order = await OrderModel.findById(id)
        .populate("user", "name email")
        .populate("items.product", "name image price")
        .populate("address"); // ✅ YEH LINE ADD KARO

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      console.log("✅ Order with populated address:", order);

      res.status(200).json({
        success: true,
        order,
      });
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching order",
      });
    }
  };

  // Update Order Status
  static updateOrderStatus = async (req, res) => {
    try {
      const { id } = req.params;
      const { orderStatus } = req.body;

      const validStatuses = [
        "Placed",
        "Accepted",
        "Packed",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
      ];

      if (!validStatuses.includes(orderStatus)) {
        return res.status(400).json({
          message: "Invalid order status",
        });
      }

      const order = await OrderModel.findByIdAndUpdate(
        id,
        { orderStatus },
        { new: true },
      );

      if (!order) {
        return res.status(404).json({
          message: "Order not found",
        });
      }

      res.status(200).json({
        message: "Order status updated successfully",
        order,
      });
    } catch (error) {
      console.error("Error updating order:", error);
      res.status(500).json({
        message: "Error updating order",
      });
    }
  };

  // Delete Order by ID
  static deleteOrder = async (req, res) => {
    try {
      const { id } = req.params;

      const order = await OrderModel.findByIdAndDelete(id);

      if (!order) {
        return res.status(404).json({
          message: "Order not found",
        });
      }

      // ✅ Restore product stock if order was not delivered
      if (order.orderStatus !== "Delivered") {
        for (const item of order.items) {
          await ProductModel.findByIdAndUpdate(item.product, {
            $inc: { stock: item.quantity },
          });
        }
      }

      res.status(200).json({
        message: "Order deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting order:", error);
      res.status(500).json({
        message: "Error deleting order",
      });
    }
  };

  // ADMIN PROFILE ROUTES

  // ===== GET ADMIN PROFILE =====
  static getAdminProfile = async (req, res) => {
    try {
      const adminId = req.user?.userId;

      const admin = await UserModel.findById(adminId).select("-password");

      if (!admin) {
        return res.status(404).json({
          success: false,
          message: "Admin not found",
        });
      }

      if (admin.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Access denied. Admin only.",
        });
      }

      res.status(200).json({
        success: true,
        user: admin,
      });
    } catch (error) {
      console.error("❌ Error fetching admin profile:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch admin profile",
        error: error.message,
      });
    }
  };

  // ===== UPDATE ADMIN PROFILE =====
  static updateAdminProfile = async (req, res) => {
    try {
      const adminId = req.user?.userId;
      const { name, email } = req.body;

      const admin = await UserModel.findById(adminId);

      if (!admin) {
        return res.status(404).json({
          success: false,
          message: "Admin not found",
        });
      }

      if (admin.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Access denied. Admin only.",
        });
      }

      if (email && email !== admin.email) {
        const existingUser = await UserModel.findOne({
          email: email.toLowerCase().trim(),
        });
        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: "Email already in use",
          });
        }
      }

      if (name) admin.name = name;
      if (email) admin.email = email.toLowerCase().trim();

      await admin.save();

      const updatedAdmin =
        await UserModel.findById(adminId).select("-password");

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        user: updatedAdmin,
      });
    } catch (error) {
      console.error("❌ Error updating admin profile:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update admin profile",
        error: error.message,
      });
    }
  };

  // ===== CHANGE ADMIN PASSWORD =====
  static changeAdminPassword = async (req, res) => {
    try {
      const adminId = req.user?.userId;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "Current password and new password are required",
        });
      }

      const admin = await UserModel.findById(adminId);

      if (!admin) {
        return res.status(404).json({
          success: false,
          message: "Admin not found",
        });
      }

      if (admin.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Access denied. Admin only.",
        });
      }

      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        admin.password,
      );
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Current password is incorrect",
        });
      }

      admin.password = newPassword;
      await admin.save();

      res.status(200).json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error) {
      console.error("❌ Error changing admin password:", error);
      res.status(500).json({
        success: false,
        message: "Failed to change password",
        error: error.message,
      });
    }
  };
}

export default AdminController;
