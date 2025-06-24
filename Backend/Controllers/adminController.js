const UserModel = require("../Models/UserModel.js");
const FirmModel = require("../Models/FirmModel");
const StockCategoryModel = require("../Models/StockCetegoryModel.js");
const CustomerModel = require("../Models/CustomersModel.js"); // Added missing import
const StockModel = require("../Models/StockModel.js");
const RawMaterialModel = require("../Models/RawMaterialModel.js");
const DailrateModel = require("../Models/DailrateModel.js");
const SaleModel = require("../Models/SaleModel.js");
const PaymentModel = require("../Models/PaymentModel.js");
const UdharModel = require("../Models/UdharModel.js");
const udharsetelmentModel = require("../Models/udharSetalmentModel.js");

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
    const user = await UserModel.findById(userId);
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
    res.cookie("token", token, { httpOnly: true });
    res
      .status(200)
      .json({ message: "Login successful", token, role: user.role });
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
    const logoPath = req.file.path
      .replace(/^.*[\\\/]Uploads[\\\/]/, "Uploads/")
      .replace(/\\/g, "/");
    console.log("Stored logo path:", logoPath); // Debug log
    console.log("Actual file path on disk:", req.file.path); // Debug log
    const newFirm = new FirmModel({
      name,
      location,
      size,
      logo: logoPath,
      owner: req.user?._id,
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
  const { firmId } = req.query;
  try {
    const firm = await FirmModel.findOne({ _id: firmId, removeAt: null });
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

module.exports.AddCustomer = async (req, res) => {
  const { name, email, contact, firm, address } = req.body;
  try {
    if (!name || !email || !contact || !firm || !address) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const existingCustomer = await CustomerModel.findOne({
      email: email,
      removeAt: null,
    });
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
    res
      .status(201)
      .json({ message: "Customer added successfully", customer: newCustomer });
  } catch (error) {
    console.error("Error adding customer:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await CustomerModel.find({ removeAt: null }).populate(
      "firm",
      "name"
    );
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
    // Store relative path starting from Uploads/
    const imagePath = req.file.path
      .replace(/^.*[\\\/]Uploads[\\\/]/, "Uploads/")
      .replace(/\\/g, "/");
    console.log("Stored image path:", imagePath); // Debug log
    console.log("Actual file path on disk:", req.file.path); // Debug log

    const newCategory = new StockCategoryModel({
      name,
      description,
      CategoryImg: imagePath,
    });
    await newCategory.save();
    res.status(201).json({
      message: "Stock category created successfully",
      category: newCategory,
    });
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
  } catch (error) {
    console.error("Error removing stock category:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.Addstock = async (req, res) => {
  const {
    name,
    materialgitType,
    waight,
    category,
    firm,
    quantity,
    price,
    makingCharge,
  } = req.body;
  //   console.log("Received data:", req.body
  // , req.file ? req.file.path : "No file uploaded"
  //   );

  try {
    if (
      !name ||
      !materialgitType ||
      !waight ||
      !category ||
      !firm ||
      !quantity ||
      !price ||
      !makingCharge
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const stockcode = `STOCK-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 15)}`; // Generate a unique stock code
    pricenum = Number(price);
    const makingChargeNum = Number(makingCharge);
    const totalValue = pricenum + makingChargeNum;
    // Calculate total value
    const newStock = new StockModel({
      name,
      materialgitType,
      waight,
      category,
      firm,
      quantity,
      price,
      makingCharge,
      stockcode,
      totalValue,
      stockImg: req.file ? req.file.path : null, // Handle file upload
    });
    await newStock.save();
    res
      .status(201)
      .json({ message: "Stock added successfully", stock: newStock });
  } catch (error) {
    console.error("Error adding stock:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.getAllStocks = async (req, res) => {
  try {
    const stocks = await StockModel.find({ removeAt: null })
      .populate("category", "name")
      .populate("firm", "name");
    res.status(200).json(stocks);
  } catch (error) {
    console.error("Error fetching stocks:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.removeStock = async (req, res) => {
  const { stockId } = req.query;
  try {
    const stock = await StockModel.findById(stockId);
    if (!stock) {
      return res.status(404).json({ message: "Stock not found" });
    }
    stock.removeAt = new Date();
    await stock.save();
    res.status(200).json({ message: "Stock removed successfully" });
  } catch (error) {
    console.error("Error removing stock:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.getStockbyCategory = async (req, res) => {
  const { categoryId } = req.query;
  try {
    const stocks = await StockModel.find({
      category: categoryId,
      removeAt: null,
    })
      .populate("category", "name")
      .populate("firm", "name");
    res.status(200).json(stocks);
  } catch (error) {
    console.error("Error fetching stocks by category:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.getStockbyFirm = async (req, res) => {
  const { firmId } = req.query;
  try {
    const stocks = await StockModel.find({ firm: firmId, removeAt: null })
      .populate("category", "name")
      .populate("firm", "name");
    res.status(200).json(stocks);
  } catch (error) {
    console.error("Error fetching stocks by firm:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.createRawMaterial = async (req, res) => {
  const { name, materialType, weight, firm } = req.body;
  try {
    if (!name || !materialType || !weight || !firm || !req.file) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const RawMaterialcode = `RAW-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 15)}`; // Generate a unique raw material code
    const newRawMaterial = new RawMaterialModel({
      name,
      materialType,
      weight,
      rawmaterialImg: req.file.path,
      RawMaterialcode,
      firm,
    });
    await newRawMaterial.save();
    res.status(201).json({
      message: "Raw material created successfully",
      rawMaterial: newRawMaterial,
    });
  } catch (error) {
    console.error("Error creating raw material:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.getAllRawMaterials = async (req, res) => {
  try {
    const rawMaterials = await RawMaterialModel.find({
      removeAt: null,
    }).populate("firm", "name");
    res.status(200).json(rawMaterials);
  } catch (error) {
    console.error("Error fetching raw materials:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.removeRawMaterial = async (req, res) => {
  const { rawMaterialId } = req.query;
  try {
    const rawMaterial = await RawMaterialModel.findById(rawMaterialId);
    if (!rawMaterial) {
      return res.status(404).json({ message: "Raw material not found" });
    }
    rawMaterial.removeAt = new Date();
    await rawMaterial.save();
    res.status(200).json({ message: "Raw material removed successfully" });
  } catch (error) {
    console.error("Error removing raw material:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
module.exports.getRawMaterialbyFirm = async (req, res) => {
  const { firmId } = req.query;
  try {
    const rawMaterials = await RawMaterialModel.find({
      firm: firmId,
      removeAt: null,
    }).populate("firm", "name");
    res.status(200).json(rawMaterials);
  } catch (error) {
    console.error("Error fetching raw materials by firm:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.getRawMaterialbyType = async (req, res) => {
  const { materialType } = req.query;
  try {
    const rawMaterials = await RawMaterialModel.find({
      materialType,
      removeAt: null,
    }).populate("firm", "name");
    res.status(200).json(rawMaterials);
  } catch (error) {
    console.error("Error fetching raw materials by type:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.AddRawMaterialStock = async (req, res) => {
  const { rawMaterialId, weight } = req.body;
  try {
    if (rawMaterialId && weight) {
      const rawMaterial = await RawMaterialModel.findById(rawMaterialId);
      if (!rawMaterial) {
        return res.status(404).json({ message: "Raw material not found" });
      }
      rawMaterial.weight += Number(weight); // Add the new weight to the existing weight
      await rawMaterial.save();
      res.status(200).json({
        message: "Raw material stock updated successfully",
        rawMaterial,
      });
    }
  } catch (error) {
    console.error("Error updating raw material stock:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.createDailrate = async (req, res) => {
  const { date, rate } = req.body;
  try {
    if (!date || !rate) {
      return res.status(400).json({ message: "Date and rate are required" });
    }
    const existingRate = await DailrateModel.findOne({ date: new Date(date) });
    if (existingRate) {
      return res
        .status(400)
        .json({ message: "Rate for this date already exists" });
    }
    const newDailrate = new DailrateModel({
      date: new Date(date),
      rate,
    });
    await newDailrate.save();
    res.status(201).json({
      message: "Daily rate created successfully",
      dailrate: newDailrate,
    });
  } catch (error) {
    console.error("Error creating daily rate:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.getAllDailrates = async (req, res) => {
  try {
    const dailrates = await DailrateModel.find().sort({ date: -1 });
    res.status(200).json(dailrates);
  } catch (error) {
    console.error("Error fetching daily rates:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.getTodayDailrate = async (req, res) => {
  try {
    const today = new Date();
    console.log("Today's date:", today); // Debug log

    const dailrate = await DailrateModel.findOne({ date: today });
    if (!dailrate) {
      return res
        .status(404)
        .json({ message: "Daily rate for today not found" });
    }
    res.status(200).json(dailrate);
  } catch (error) {
    console.error("Error fetching today's daily rate:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.createSale = async (req, res) => {
  const {
    items,
    customer,
    firm,
    totalAmount,
    saleDate,
    paymentMethod,
    paymentAmount,
    UdharAmount,
  } = req.body;
  try {
    if (
      !items ||
      !customer ||
      !firm ||
      !totalAmount ||
      !paymentMethod
      || !paymentAmount
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const newSale = new SaleModel({
      items,
      customer,
      firm,
      totalAmount,
      saleDate:  new Date().toISOString().slice(0, 10),
      paymentMethod,
    });
    await newSale.save();
    // Create a payment record for the sale
    const payment = new PaymentModel({
      paymentType: paymentMethod,
      paymentRefrence: `PAY-${newSale._id}`,
      amount: paymentAmount,
      paymentDate: new Date().toISOString().slice(0, 10),
      sale: newSale._id,
      customer: customer,
      firm: firm,
    });
    await payment.save();
    // Update the sale with the payment reference
    if (UdharAmount && UdharAmount > 0) {
      const udhar = new UdharModel({
        customer: customer,
        firm: firm,
        amount: UdharAmount,
        sale: newSale._id
      });
      await udhar.save();
      // Create udhar settlement record
      res
        .status(201)
        .json({ message: "Sale created successfully ", sale: newSale });
    }
  } catch (error) {
    console.errr("Error creating sale:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.getAllSales = async (req, res) => {
  try {
    const sales = await SaleModel.find({ removeAt: null })
      .populate("customer", "name email")
      .populate("firm", "name")
      .populate("items.saleType", "name");
    res.status(200).json(sales);
  } catch (error) {
    console.error("Error fetching sales:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.removeSale = async (req, res) => {
  const { saleId } = req.query;
  try {
    const sale = await SaleModel.findById(saleId);
    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }
    sale.removeAt = new Date();
    await sale.save();
    res.status(200).json({ message: "Sale removed successfully" });
  } catch (error) {
    console.error("Error removing sale:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.getSaleByCustomer = async (req, res) => {
  const { customerId } = req.query;
  try {
    const sales = await SaleModel.find({ customer: customerId, removeAt: null })
      .populate("customer", "name email")
      .populate("firm", "name")
      .populate("items.saleType", "name");
    res.status(200).json(sales);
  } catch (error) {
    console.error("Error fetching sales by customer:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.getSaleByFirm = async (req, res) => {
  const { firmId } = req.query;
  try {
    const sales = await SaleModel.find({ firm: firmId, removeAt: null })
      .populate("customer", "name email")
      .populate("firm", "name")
      .populate("items.saleType", "name");
    res.status(200).json(sales);
  } catch (error) {
    console.error("Error fetching sales by firm:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.getSaleByDate = async (req, res) => {
  const { date } = req.query;
  try {
    const sales = await SaleModel.find({
      saleDate: new Date(date),
      removeAt: null,
    })
      .populate("customer", "name email")
      .populate("firm", "name")
      .populate("items.saleType", "name");
    res.status(200).json(sales);
  } catch (error) {
    console.error("Error fetching sales by date:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.getSaleByPaymentMethod = async (req, res) => {
  const { paymentMethod } = req.query;
  try {
    const sales = await SaleModel.find({
      paymentMethod,
      removeAt: null,
    })
      .populate("customer", "name email")
      .populate("firm", "name")
      .populate("items.saleType", "name");
    res.status(200).json(sales);
  } catch (error) {
    console.error("Error fetching sales by payment method:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.getAllPayments = async (req, res) => {
  try {
    const payments = await PaymentModel.find({ removeAt: null })
      .populate("sale", "items totalAmount")
      .populate("customer", "name email")
      .populate("firm", "name");
    res.status(200).json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports.getPaymentByCustomer = async (req, res) => {
  const { customerId } = req.query;
  try {
    const payments = await PaymentModel.find({
      customer: customerId,
      removeAt: null,
    })
      .populate("sale", "items totalAmount")
      .populate("customer", "name email")
      .populate("firm", "name");
    res.status(200).json(payments);
  } catch (error) {
    console.error("Error fetching payments by customer:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.getPaymentByFirm = async (req, res) => {
  const { firmId } = req.query;
  try {
    const payments = await PaymentModel.find({
      firm: firmId,
      removeAt: null,
    })
      .populate("sale", "items totalAmount")
      .populate("customer", "name email")
      .populate("firm", "name");
    res.status(200).json(payments);
  } catch (error) {
    console.error("Error fetching payments by firm:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.getPaymentBydate = async (req, res) => {
  const { date } = req.query;
  try {
    const payments = await PaymentModel.find({
      paymentDate: new Date(date),
      removeAt: null,
    })
      .populate("sale", "items totalAmount")
      .populate("customer", "name email")
      .populate("firm", "name");
    res.status(200).json(payments);
  } catch (error) {
    console.error("Error fetching payments by date:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports.getPaymentByPaymentMethod = async (req, res) => {
  const { paymentMethod } = req.query;
  try {
    const payments = await PaymentModel.find({
      paymentType: paymentMethod,
      removeAt: null,
    })
      .populate("sale", "items totalAmount")
      .populate("customer", "name email")
      .populate("firm", "name");
    res.status(200).json(payments);
  } catch (error) {
    console.error("Error fetching payments by payment method:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.getAllUdhar = async (req, res) => {
  try {
    const udhar = await UdharModel.find({ removeAt: null })
      .populate("customer", "name email")
      .populate("firm", "name");
    res.status(200).json(udhar);
  } catch (error) {
    console.error("Error fetching udhar:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.getUdharByCustomer = async (req, res) => {
  const { customerId } = req.query;
  try {
    const udhar = await UdharModel.find({
      customer: customerId,
      removeAt: null,
    })
      .populate("customer", "name email")
      .populate("firm", "name");
    res.status(200).json(udhar);
  } catch (error) {
    console.error("Error fetching udhar by customer:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.getUdharByFirm = async (req, res) => {
  const { firmId } = req.query;
  try {
    const udhar = await UdharModel.find({
      firm: firmId,
      removeAt: null,
    }) .populate("customer", "name email")
      .populate("firm", "name");
    res.status(200).json(udhar);
  } catch (error) {
    console.error("Error fetching udhar by firm:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports.getUdharByDate = async (req, res) => {
  const { date } = req.query;
  try {
    const udhar = await UdharModel.find({
      createdAt: new Date(date),
      removeAt: null,
    })
      .populate("customer", "name email")
      .populate("firm", "name");
    res.status(200).json(udhar);
  } catch (error) {
    console.error("Error fetching udhar by date:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

