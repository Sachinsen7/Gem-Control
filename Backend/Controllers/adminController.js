const UserModel = require("../Models/UserModel.js");
const FirmModel = require("../Models/FirmModel");
const CustomerModel = require("../Models/CustomerModel");
const StockCategoryModel = require("../Models/StockCetegoryModel");


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
    res.status(200).json({ message: "Login successful", token, role });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.logoutUser = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logout successful" });
};

module.exports.createFirm =  async (req, res) => {
  const { name, location, size } = req.body;
  // console.log(req.file);
  
  try {
    if (!name || !location || !size || !req.file) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const newFirm = new FirmModel({
      name,
      location,
      size,
      logo: req.file ? req.file.path : null,
      owner : req.user._id, // Assuming req.user is set by isLoggedIn middleware
    });
    await newFirm.save();
    res.status(201).json({ message: "Firm created successfully", firm: newFirm });
  } catch (error) {
    console.error("Error creating firm:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.getAllFirms = async (req, res) => {
  try {
    const firms = await FirmModel.find({ removeAt: null , owner: req.user._id }).populate("owner", "name email");
    res.status(200).json(firms);
  } catch (error) {
    console.error("Error fetching firms:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
module.exports.removeFirm = async (req, res) => {
  const { firmId } = req.query;
  if (!firmId) {
    return res.status(400).json({ message: "Firm ID is required" });
  }
  try {
    const firm = await FirmModel.findOne({ _id: firmId , removeAt: null });
    if (!firm) {
      return res.status(404).json({ message: "Firm not found" });
    }
    firm.removeAt = new Date();
    await firm.save();
    res.status(200).json({ message: "Firm removed successfully" });
  }
  catch (error) {
    console.error("Error removing firm:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports.AddCustomer = async (req, res) => {
  const { name , email , contact, firm ,  address } = req.body;
  try {
    if (!name || !email || !contact || !firm || !address) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const existingCustomer = await CustomerModel.findOne({ email: email, removeAt: null });
    if (existingCustomer) {
      return res.status(400).json({ message: "Customer already exists" });
    }
    const newCustomer = new CustomerModel({
      name,
      email,
      contact,
      firm,
      address,
    });
    await newCustomer.save();
    res.status(201).json({ message: "Customer added successfully", customer: newCustomer });
  } catch (error) {
    console.error("Error adding customer:", error);
    res.status(500).json({ message: "Internal server error" });
  }

}

module.exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await CustomerModel.find({ removeAt: null }).populate("firm", "name");
    res.status(200).json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.removeCustomer = async (req, res) => {
  const { customerId } = req.query;
  try {
    const customer = await CustomerModel.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    customer.removeAt = new Date();
    await customer.save();
    res.status(200).json({ message: "Customer removed successfully" });
  } catch (error) {
    console.error("Error removing customer:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.createStockCategory = async (req, res) => {
  const { name, description } = req.body;
  try {
    if (!name || !description || !req.file) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const newCategory = new StockCategoryModel({
      name,
      description,
      CategoryImg: req.file.path,
    });
    await newCategory.save();
    res.status(201).json({ message: "Stock category created successfully", category: newCategory });
  } catch (error) {
    console.error("Error creating stock category:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
module.exports.getAllStockCategories = async (req, res) => {
  try {
    const categories = await StockCategoryModel.find({ removeAt: null });
    res.status(200).json(categories);
  } catch (error) {
    console.error("Error fetching stock categories:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.removeStockCategory = async (req, res) => {
  const { categoryId } = req.query;
  try {
    const category = await StockCategoryModel.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Stock category not found" });
    }
    category.removeAt = new Date();
    await category.save();
    res.status(200).json({ message: "Stock category removed successfully" });
  }
  catch (error) {
    console.error("Error removing stock category:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}






