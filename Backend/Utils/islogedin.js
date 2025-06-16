const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const UserModel = require("../Models/UserModel");
require("dotenv").config();
module.exports.isLoggedIn = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await UserModel.findById(decoded.userId);

    if (!user || user.removeAt) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error in isLoggedIn middleware:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
module.exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Forbidden: Admin access required" });
  }
};
module.exports.isStaff = (req, res, next) => {
  if (req.user && req.user.role === "Staff") {
    next();
  } else {
    res.status(403).json({ message: "Forbidden: Staff access required" });
  }
};
