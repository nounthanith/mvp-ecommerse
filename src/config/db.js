const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    mongoose.connect(process.env.MONGO_URI).then(() => {
      console.log(`MongoDB Connected`);
    }).catch((err) => {
      console.error("Error connecting to MongoDB:", err.message);
      process.exit(1);
    });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
  }
};

module.exports = connectDB;
