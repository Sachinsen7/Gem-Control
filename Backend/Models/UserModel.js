const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  contact: { type: String, required: true },
  password: { type: String, required: true },
  role: {
    type: String,
    required: true,
    enum: ["admin", "staff", "user"], // Added "user" to the enum
  },
  removeAt: { type: Date, default: null },
});

module.exports = mongoose.model("User", userSchema);
