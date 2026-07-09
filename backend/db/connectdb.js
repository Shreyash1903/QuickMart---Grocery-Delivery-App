// 👉 Mongoose library import ki hai jo Node.js ko MongoDB se connect karne ke liye use hoti hai.
import mongoose from "mongoose";

// Using async/await for better readability and error handling
// 👉 connectDB naam ka asynchronous function banaya hai jo MongoDB connection URL receive karta hai.
const connectDB =  async (DATABASE_URL) => {
  try {

    // 👉 Database options define kiye hain.
    const DB_OPTIONS = {
      dbName: "Login_Registration_DB", // Specify the database name 
    };

    // 👉 Ye line actual MongoDB connection establish karti hai.
    await mongoose.connect(DATABASE_URL, DB_OPTIONS);

    // 👉 Agar connection successful ho jata hai to terminal me success message print hota hai.
    console.log("Connected Successfully to MongoDB");
  } catch (error) { // 👉 Agar database connection fail ho jaye to control catch block me aa jata hai.
    console.error("Error connecting to MongoDB :", error); // Error message print hota hai.
  }
};

// 👉 connectDB function ko export kiya hai taaki server.js ya app.js me import karke use kar sake.
export default connectDB;

// dbName batata hai ki MongoDB me kis database se connect hona hai.
// Agar ye database exist nahi karta to MongoDB automatically create kar deta hai.

// DATABASE_URL → MongoDB connection string
// DB_OPTIONS → Database name aur other options
// await use kiya hai taaki connection complete hone ke baad hi next line execute ho.

// "Is file ka purpose MongoDB se connection establish karna hai. Maine Mongoose library use ki hai. connectDB ek async function hai jo database URL aur database name ke saath MongoDB se connect karta hai. Agar connection successful hota hai to success message print hota hai, aur agar koi error aati hai to catch block usse handle karta hai. Is function ko export kiya hai taaki application start hote hi server.js se call kiya ja sake."