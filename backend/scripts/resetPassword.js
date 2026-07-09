// backend/scripts/resetPassword.js

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

const resetPassword = async () => {
  try {
    console.log("\n🔑 QuickMart - Reset Password\n");
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

    // Get user email
    const email = await question("📧 Enter user email: ");

    if (!email) {
      log.error("Email is required!");
      await mongoose.disconnect();
      process.exit(1);
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      log.error(`User with email "${email}" not found!`);
      await mongoose.disconnect();
      process.exit(1);
    }

    // Show user info
    log.divider();
    console.log("👤 User Found:");
    console.log("   Name:", user.name);
    console.log("   Email:", user.email);
    console.log("   Role:", user.role);
    console.log("   Status:", user.isActive ? "✅ Active" : "❌ Inactive");
    log.divider();

    // Confirm
    const confirm = await question("\nReset password for this user? (y/n): ");

    if (confirm.toLowerCase() !== "y") {
      console.log("\n👋 Cancelled.");
      await mongoose.disconnect();
      process.exit(0);
    }

    // Get new password
    const newPassword = await question("🔑 New password (min 6 chars): ");

    if (newPassword.length < 6) {
      log.error("Password must be at least 6 characters long!");
      await mongoose.disconnect();
      process.exit(1);
    }

    const confirmPassword = await question("🔑 Confirm new password: ");

    if (newPassword !== confirmPassword) {
      log.error("Passwords do not match!");
      await mongoose.disconnect();
      process.exit(1);
    }

    // ✅ Password hash ho jayega (pre-save hook se)
    user.password = newPassword;
    await user.save();

    log.success("Password updated successfully!\n");
    log.divider();
    console.log("✅ Password Reset Complete!");
    log.divider();
    console.log("📧 Email:", user.email);
    log.divider();

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    log.error("Error resetting password:", error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

resetPassword();
