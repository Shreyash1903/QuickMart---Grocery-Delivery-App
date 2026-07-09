// backend/scripts/createAdmin.js

import mongoose from "mongoose";
import dotenv from "dotenv";
import readline from "readline";
import User from "../models/User.js";

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query) =>
  new Promise((resolve) => rl.question(query, resolve));

const log = {
  info: (msg) => console.log("ℹ️", msg),
  success: (msg) => console.log("✅", msg),
  error: (msg) => console.log("❌", msg),
  warn: (msg) => console.log("⚠️", msg),
  divider: () => console.log("─".repeat(55)),
};

const createAdmin = async () => {
  try {
    console.log("\n🚀 QuickCart - Admin Setup\n");
    log.divider();

    // ✅ DATABASE_URL use karein
    const dbUrl = process.env.DATABASE_URL;

    if (!dbUrl) {
      log.error("DATABASE_URL not found in .env file!");
      log.info("Please add DATABASE_URL to your .env file");
      process.exit(1);
    }

    log.info("Connecting to MongoDB...");
    const DB_OPTIONS = {
      dbName: "Login_Registration_DB",
    };
    await mongoose.connect(dbUrl, DB_OPTIONS);
    log.success("Connected to MongoDB!\n");

    // Check if admin exists
    const existingAdmin = await User.findOne({ role: "admin" });

    if (existingAdmin) {
      log.warn("Admin already exists!");
      log.divider();
      console.log("📧 Email:", existingAdmin.email);
      console.log("👤 Name:", existingAdmin.name);
      console.log("🔑 Role:", existingAdmin.role);
      log.divider();

      const answer = await question(
        "\nDo you want to create another admin? (y/n): ",
      );

      if (answer.toLowerCase() !== "y") {
        console.log("\n👋 Exiting...");
        await mongoose.disconnect();
        process.exit(0);
      }
    }

    // Get admin details
    console.log("\n📝 Enter Admin Details:\n");

    const name =
      (await question("👤 Full Name (default: Super Admin): ")) ||
      "Super Admin";
    const email =
      (await question("📧 Email (default: admin@gmail.com): ")) ||
      "admin@gmail.com";
    const password =
      (await question("🔑 Password (default: admin123): ")) || "admin123";
    const confirmPassword = await question("🔑 Confirm Password: ");

    // Validate
    if (password !== confirmPassword) {
      log.error("Passwords do not match!");
      await mongoose.disconnect();
      process.exit(1);
    }

    if (password.length < 6) {
      log.error("Password must be at least 6 characters long!");
      await mongoose.disconnect();
      process.exit(1);
    }

    // Check if user exists
    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingUser) {
      log.error(`User with email "${email}" already exists!`);
      if (existingUser.role === "admin") {
        log.warn("This user is already an admin.");
      } else {
        log.warn("This user exists but is not an admin.");
      }
      await mongoose.disconnect();
      process.exit(1);
    }

    // Create admin
    log.info("Creating admin user...");

    const admin = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: password,
      role: "admin",
      isActive: true,
    });

    await admin.save();
    log.success("Admin created successfully!\n");

    // Show results
    log.divider();
    console.log("✅ Admin Created Successfully!");
    log.divider();
    console.log("📧 Email:", admin.email);
    console.log("👤 Name:", admin.name);
    console.log("🔑 Role:", admin.role);
    console.log("📅 Created:", new Date(admin.createdAt).toLocaleString());
    log.divider();

    console.log("\n🔗 Login URL: http://localhost:5000/api/auth/login");
    console.log("📱 Admin Panel: http://localhost:3001/admin/login");

    console.log("\n💡 Next Steps:");
    console.log("  1. Login with your credentials");
    console.log("  2. Start managing your store!\n");

    await mongoose.disconnect();
    log.info("Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    log.error("Error creating admin:", error.message);
    console.error(error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

// Handle cleanup
process.on("SIGINT", async () => {
  console.log("\n\n👋 Interrupted. Exiting...");
  await mongoose.disconnect();
  process.exit(0);
});

createAdmin();
