// 👉 MongoDB ke saath interact karne ke liye Mongoose import kiya hai.
import mongoose from "mongoose";

// 👉 Password ko hash (encrypt) aur compare karne ke liye bcrypt library import ki hai.
import bcrypt from "bcrypt";

// Define the User schema
// 👉 User collection ka structure define kiya hai.
const userSchema = new mongoose.Schema({
  // 👉 User ka naam store hota hai.
  name: { type: String, required: true, trim: true },
  
  // 👉 User ka email store hota hai.
  email: { type: String, required: true, trim: true, unique: true }, // Matlab same email se do account nahi ban sakte.
  
  // 👉 User ka hashed password store hota hai.
  password: { type: String, required: true, trim: true },
  
  // 👉 User ka role define karta hai.
  role: { type: String, enum: ["user", "admin"], default: "user" },

  // 👉 User active hai ya blocked.
  // isActive true hai to user active hai, false hai to user blocked hai.
  // Admin dashboard me useful hota hai.
  isActive: { type: Boolean, default: true },

  // 👉 Forgot Password ke time OTP store hota hai.
  resetOTP: { type: String },

  // 👉 OTP expiry time store hota hai.
  resetOTPExpire: { type: Date },

  // 👉 User kab register hua uski date save hoti hai.
  createdAt: { type: Date, default: Date.now },
});

// Pre-save hook to hash password before saving
userSchema.pre("save", async function () {
  // 👉 Agar password change nahi hua hai to hashing dobara mat karo.
  if (!this.isModified("password")) {
    return;
  }

  try {
    // Salt random string hoti hai jo password ko aur secure banati hai.
    const salt = await bcrypt.genSalt(10);

    // 👉 Original password ko hash karke password field me store karta hai.
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw error;
  }
});

// Method to compare passwords
// 👉 Custom method banaya hai password verify karne ke liye.
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Create the User model
// 👉 Schema se User model create kiya.
const UserModel = mongoose.model("User", userSchema);

// 👉 Dusri files me import karne ke liye export kiya.
export default UserModel;

// bcrypt.compare() kyu use karte ho?

// 👉 Hashed password ko decrypt nahi kiya ja sakta, isliye compare() entered password ko hash karke safely verify karta hai.

// "Ye file User model define karti hai. Maine Mongoose schema use karke user ke fields jaise name, email, password, role, OTP aur createdAt define kiye hain. Password ko secure rakhne ke liye pre-save hook use kiya hai jo save hone se pehle bcrypt ki help se password hash karta hai. Login ke time password verify karne ke liye comparePassword naam ka custom method banaya hai jo entered password aur hashed password ko compare karta hai. Is schema se User model create karke export kiya gaya hai."
