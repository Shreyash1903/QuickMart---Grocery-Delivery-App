// Dotenv is used to load environment variables from a .env file into process.env
import "dotenv/config";
import UserModel from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { OAuth2Client } from "google-auth-library";

// Used for Creating JWT Tokens (🔥 move to .env in real projects)
const JWT_SECRET = process.env.JWT_SECRET; // 👉 Secret key for signing JWT tokens

// Google Credentials
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Function to generate a 6-digit OTP
const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// Configure transporter using environment variables when available.
// In development, if no SMTP creds are provided, create an Ethereal test account.
let transporter;
(async () => {
  try {
    const smtpHost = process.env.SMTP_HOST || "smtp.ethereal.email";
    const smtpPort = process.env.SMTP_PORT
      ? parseInt(process.env.SMTP_PORT)
      : 587;
    const smtpSecure = process.env.SMTP_SECURE === "true"; // set to "true" for port 465

    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      console.log("Using SMTP credentials from environment variables");
    } else {
      // Create an ethereal test account for development/testing
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log(
        "No SMTP env vars found — created Ethereal test account:",
        testAccount.user,
      );
      console.log(
        "Check messages at Ethereal or use nodemailer.getTestMessageUrl(info) after sendMail",
      );
    }

    // Verify SMTP configuration at startup (helpful during development)
    transporter.verify((err, success) => {
      if (err) {
        console.error("SMTP configuration/connection error:", err);
      } else {
        console.log("SMTP server is ready to take messages");
      }
    });
  } catch (err) {
    console.error("Failed to initialize mail transporter:", err);
  }
})();

// UserController class handles user-related operations such as registration, login, password reset, and fetching current user details.

class UserController {
  // ================= REGISTER =================
  // Ye function new user ko register karta hai.
  // static - Ye method class ka object banaye bina call ho sakta hai.
  static createUser = async (req, res) => {
    try {
      const { name, email, password } = req.body;

      // 👉 Check if user already exists in DB
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // If not existing user, create new user
      // Password will be hashed by the User model pre-save hook.
      const user = new UserModel({
        name: name,
        email: email,
        password: password,
      });

      // 👉 Save user in MongoDB
      await user.save();

      // ✅ Respond with success message (don't send password back)
      res.status(201).json({
        message: "User Registered Successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Error registering user" });
    }
  };

  // ================= LOGIN =================
  static verifyUser = async (req, res) => {
    try {
      const { email, password } = req.body; // Destructuring email and password from request body

      // 👉 Check if user exists in DB
      const user = await UserModel.findOne({ email });

      // If user not found, return error
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }

      // 🔥 Compare provided password with hashed password in DB
      const isMatch = await bcrypt.compare(password, user.password);

      // If password doesn't match, return error
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid password" });
      }

      // If Password matches and login successful, create JWT token and send response to frontend
      // frontend me localStorage me token store hoga aur har request ke sath bheja jayega.
      // 🔥 THIS LINE CREATE JWT TOKEN
      // jwt.sign() - JWT Token generate karta hai.
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        JWT_SECRET,
        {
          expiresIn: "30d", // Token 30 days ke liye valid rahega
        },
      );

      // 👉 Send token + user data to frontend
      res.status(200).json({
        message: "Login successful",
        // Sabse pehle ye JWT token(string) "token" variable me save hota hai.
        token, // ✅ send token
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Error logging in" });
    }
  };

  // ================= GOOGLE LOGIN =================
  // static googleLogin = async (req, res) => {
  //   try {
  //     const { token } = req.body;

  //     console.log("[googleLogin] received body:", req.body);
  //     console.log(
  //       "[googleLogin] GOOGLE_CLIENT_ID:",
  //       process.env.GOOGLE_CLIENT_ID,
  //     );

  //     if (!token) {
  //       console.log("[googleLogin] No token provided");
  //       return res.status(400).json({
  //         message: "Google token is required",
  //       });
  //     }

  //     // Verify Google Token
  //     const ticket = await client.verifyIdToken({
  //       idToken: token,
  //       audience: process.env.GOOGLE_CLIENT_ID,
  //     });

  //     const payload = ticket.getPayload();

  //     const { email, name, picture, email_verified } = payload;

  //     if (!email_verified) {
  //       return res.status(400).json({
  //         message: "Google email not verified",
  //       });
  //     }

  //     // Check if user already exists
  //     let user = await UserModel.findOne({ email });

  //     // Create new user if first login
  //     if (!user) {
  //       const randomPassword = await bcrypt.hash(
  //         Math.random().toString(36),
  //         10,
  //       );

  //       user = await UserModel.create({
  //         name,
  //         email,
  //         password: randomPassword,
  //       });
  //     }

  //     // Generate JWT
  //     const jwtToken = jwt.sign(
  //       {
  //         userId: user._id,
  //         role:user.role
  //       },
  //       JWT_SECRET,
  //       {
  //         expiresIn: "30d",
  //       },
  //     );

  //     return res.status(200).json({
  //       message: "Google Login Successful",
  //       token: jwtToken,
  //       user: {
  //         id: user._id,
  //         name: user.name,
  //         email: user.email,
  //         role: user.role,
  //       },
  //     });
  //   } catch (error) {
  //     console.error("[googleLogin] error:", error);
  //     console.error("[googleLogin] error message:", error.message);
  //     console.error("[googleLogin] error stack:", error.stack);

  //     return res.status(500).json({
  //       message: "Google Login Failed",
  //     });
  //   }
  // };

  // ================= FORGOT PASSWORD =================
  static userForgotPassword = async (req, res) => {
    try {
      const { email } = req.body; // Frontend se email receive hota hai.
      const user = await UserModel.findOne({ email }); // MongoDB me check karega

      // Agar user nahi mila toh error message bhejega.
      if (!user) {
        // if(user==null)
        return res.status(400).json({ message: "User not found" });
      }

      // Create a 6-digit OTP for password reset
      const resetOtp = generateOtp();

      // OTP Database me save karna hai aur 10 minutes ke liye valid hoga.
      user.resetOTP = resetOtp;
      user.resetOTPExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

      // Ye line MongoDB me permanently save karti hai.
      await user.save();

      // Send the email
      // Ye Nodemailer ka function hai.
      // Ye Gmail ya SMTP server ke through email bhejta hai.
      await transporter.sendMail({
        from: '"Forgot Password" <no-reply@example.com>',
        to: user.email, // Kis email pe OTP bhejna hai.
        subject: "Your password reset OTP",
        html: `
          <p>You are receiving this email because a password reset was requested for your account.</p>
          <p>Your OTP is :</p>
          <h2 style="letter-spacing: 4px;">${resetOtp}</h2>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
        `,
      });

      // Agar email successfully bhej diya toh success message bhejega.
      res.status(200).json({ message: "OTP sent to your email" });
    } catch (error) {
      // Log the full error on the server for debugging
      console.error("Error in userForgotPassword:", error);
      // During development return the error message to the client to help debugging.
      // In production, avoid returning raw error details.
      return res.status(500).json({
        message: error.message || "Error sending password reset email",
      });
    }
  };

  // ================= VERIFY OTP =================
  static verifyResetOtp = async (req, res) => {
    try {
      const { email, otp } = req.body; // Frontend se email aur OTP receive hota hai.

      // MongoDB me check karega ki email aur OTP match karte hai ya nahi aur OTP expire nahi hua hai.
      const user = await UserModel.findOne({
        email,
        resetOTP: otp,
        resetOTPExpire: { $gt: Date.now() },
      });

      // Agar user nahi mila toh error message bhejega.
      if (!user) {
        return res.status(400).json({ message: "Invalid or expired OTP." });
      }

      // Agar user mila toh success message bhejega.
      res.status(200).json({ message: "OTP verified successfully." });
    } catch (error) {
      res.status(500).json({ message: "Error verifying OTP." });
    }
  };

  // ================= RESET PASSWORD =================
  static userResetPassword = async (req, res) => {
    try {
      const { email, otp, password } = req.body; // Frontend se email, OTP aur new password receive hota hai.

      // MongoDB me check karega ki email aur OTP match karte hai ya nahi aur OTP expire nahi hua hai.
      const user = await UserModel.findOne({
        email,
        resetOTP: otp,
        resetOTPExpire: { $gt: Date.now() },
      });

      // Agar user nahi mila toh error message bhejega.
      if (!user) {
        return res.status(400).json({ message: "Invalid or expired OTP." });
      }

      // Hash new password and save
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
      user.resetOTP = undefined;
      user.resetOTPExpire = undefined;
      await user.save();

      res
        .status(200)
        .json({ message: "Password has been reset successfully." });
    } catch (error) {
      res.status(500).json({ message: "Error resetting password." });
    }
  };

  // ================= GET CURRENT USER (/me) =================
  static me = async (req, res) => {
    try {
      const userId = req.user.userId;
      const user = await UserModel.findById(userId).select("-password");

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({
        message: "Current user",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching dashboard" });
    }
  };

  // ================= UPDATE PROFILE =================
  static updateProfile = async (req, res) => {
    try {
      const userId = req.user.userId;
      const { name } = req.body;

      const user = await UserModel.findById(userId);

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      user.name = name || user.name;

      await user.save();

      res.status(200).json({
        message: "Profile updated successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error) {
      res.status(500).json({
        message: "Error updating profile",
      });
    }
  };

  // ================= CHANGE PASSWORD =================
  static changePassword = async (req, res) => {
    try {
      const userId = req.user.userId;

      const { currentPassword, newPassword } = req.body;

      const user = await UserModel.findById(userId);

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);

      if (!isMatch) {
        return res.status(400).json({
          message: "Current password is incorrect",
        });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      user.password = hashedPassword;

      await user.save();

      res.status(200).json({
        message: "Password changed successfully",
      });
    } catch (error) {
      res.status(500).json({
        message: "Error changing password",
      });
    }
  };
}

export default UserController;
