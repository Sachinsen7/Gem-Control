const express = require("express");
const router = express.Router();
const { upload } = require("../Utils/UploadFile.js");
const { isLoggedIn, isAdmin, isStaff } = require("../Utils/islogedin");

const {
  RegisterUser,
  GetAllUsers,
  removeUser,
  loginUser,
  logoutUser,
  createFirm,
  getAllFirms,
  removeFirm,
  AddCustomer,
  removeCustomer,
  getAllCustomers,
  createStockCategory,
  getAllStockCategories,
  removeStockCategory,
  Addstock,
  getAllStocks,
  removeStock,
  getStockbyCategory,
  getStockbyFirm,
  createRawMaterial,
  getAllRawMaterials,
  getRawMaterialbyFirm,
  getRawMaterialbyType,
  AddRawMaterialStock,
  createDailrate,
  getAllDailrates,
  getTodayDailrate,
  removeRawMaterial,
  createSale,
  getAllSales,
  removeSale,
  getSaleByCustomer,
  getSaleByFirm,
  getSaleByDate,
  getSaleByPaymentMethod,
} = require("../Controllers/adminController");

router.post("/register", RegisterUser);
router.get("/GetallUsers", isLoggedIn, GetAllUsers);
router.get("/remove/:userId", removeUser);
router.post("/login", loginUser);
router.get("/logout", logoutUser);
router.post(
  "/createFirm",
  isLoggedIn,
  isAdmin,
  upload.single("logo"),
  createFirm
);
router.get("/getAllFirms", isLoggedIn, getAllFirms);
router.get("/removeFirm", isLoggedIn, isAdmin, removeFirm);
router.post("/AddCustomer", isLoggedIn, AddCustomer);
router.get("/getAllCustomers", isLoggedIn, getAllCustomers);
router.get("/removeCustomer", isLoggedIn, isStaff, removeCustomer);
router.post(
  "/createStockCategory",
  isLoggedIn,
  isAdmin,
  upload.single("CategoryImg"),
  createStockCategory
);
router.get("/getAllStockCategories", isLoggedIn, getAllStockCategories);
router.get("/removeStockCategory", isLoggedIn, removeStockCategory);
router.post("/Addstock", isLoggedIn, upload.single("stock"), Addstock);
router.get("/getAllStocks", isLoggedIn, getAllStocks);
router.get("/removeStock", isLoggedIn, removeStock);
router.get("/getStockbyCategory", isLoggedIn, getStockbyCategory);
router.get("/getStockbyFirm", isLoggedIn, getStockbyFirm);
router.post(
  "/createRawMaterial",
  isLoggedIn,
  upload.single("rawMaterial"),
  createRawMaterial
);
router.get("/getAllRawMaterials", isLoggedIn, getAllRawMaterials);
router.get("/removeRawMaterial", isLoggedIn, removeRawMaterial);
router.get("/getRawMaterialbyFirm", isLoggedIn, getRawMaterialbyFirm);
router.get("/getRawMaterialbyType", isLoggedIn, getRawMaterialbyType);
router.post("/AddRawMaterialStock", isLoggedIn, AddRawMaterialStock);
router.post("/createDailrate", isLoggedIn, createDailrate);
router.get("/getAllDailrates", isLoggedIn, getAllDailrates);
router.get("/getTodayDailrate", isLoggedIn, getTodayDailrate);
router.post("/createSale", isLoggedIn, createSale);
router.get("/getAllSales", isLoggedIn, getAllSales);
router.get("/removeSale", isLoggedIn, removeSale);
router.get("/getSaleByCustomer", isLoggedIn, getSaleByCustomer);
router.get("/getSaleByFirm", isLoggedIn, getSaleByFirm);
router.get("/getSaleByDate", isLoggedIn, getSaleByDate);
router.get("/getSaleByPaymentMethod", isLoggedIn, getSaleByPaymentMethod);


module.exports = router;
