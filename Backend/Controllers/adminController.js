const UserModel = require("../Models/UserModel.js");
const FirmModel = require("../Models/FirmModel");
const StockCategoryModel = require("../Models/StockCetegoryModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
require("dotenv").config();

module.exports.RegisterUser = async (req, res) => {
  const { name, email, contact, password, role } = req.body;
  try {
    const existingUser = await UserModel.findOne({ email: email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    if (!name || !email || !contact || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new UserModel({
      name,
      email,
      contact,
      password: hashedPassword,
      role,
    });
    await newUser.save();
    res
      .status(201)
      .json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.GetAllUsers = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const users = await UserModel.find({ removeAt: null });
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
module.exports.removeUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await UserModel.find;
    ById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.removeAt = new Date();
    await user.save();
    res.status(200).json({ message: "User removed successfully" });
  } catch (error) {
    console.error("Error removing user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await UserModel.findOne({ email: email, removeAt: null });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const role = user.role;
    res.cookie("token", token, { httpOnly: true });
    res.status(200).json({ message: "Login successful", token , role });

  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.logoutUser = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logout successful" });
};

module.exports.createFirm = async (req, res) => {
  const { name, location, size } = req.body;
  try {
    if (!name || !location || !size || !req.file) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const newFirm = new FirmModel({
      name,
      location,
      size,
      logo: req.file ? req.file.path : null,
      owner: req.user._id,
    });
    await newFirm.save();
    res
      .status(201)
      .json({ message: "Firm created successfully", firm: newFirm });
  } catch (error) {
    console.error("Error creating firm:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.getAllFirms = async (req, res) => {
  try {
    const firms = await FirmModel.find({
      removeAt: null,
      owner: req.user._id,
    }).populate("owner", "name email");
    res.status(200).json(firms);
  } catch (error) {
    console.error("Error fetching firms:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
module.exports.removeFirm = async (req, res) => {
  const { firmId } = req.params;
  try {
    const firm = await FirmModel.find;
    ById(firmId);
    if (!firm) {
      return res.status(404).json({ message: "Firm not found" });
    }
    firm.removeAt = new Date();
    await firm.save();
    res.status(200).json({ message: "Firm removed successfully" });
  } catch (error) {
    console.error("Error removing firm:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
