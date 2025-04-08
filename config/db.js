const mongoose = require("mongoose");

const MONGO_URI = "mongodb://localhost:27017/big-bang-admin";

const connectDB = async () => {
  try {
    // No need for useNewUrlParser and useUnifiedTopology anymore
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
