const express = require("express");
const router = express.Router();
const { upload } = require("../Utils/UploadFile.js");
const { isLoggedIn, isAdmin, isStaff } = require('../Utils/islogedin');
const { RegisterUser, GetAllUsers, removeUser, loginUser , logoutUser ,createFirm , getAllFirms , removeFirm , AddCustomer , getAllCustomers , removeCustomer , createStockCategory, getAllStockCategories , removeStockCategory  } = require('../Controllers/adminController');


router.post('/register', RegisterUser);
router.get('/GetallUsers', isLoggedIn, GetAllUsers);
router.get('/remove/:userId', removeUser);
router.post('/login', loginUser);
router.get('/logout', logoutUser);
router.post('/createFirm', isLoggedIn, isAdmin, upload.single('firm'), createFirm);
router.get('/getAllFirms', isLoggedIn,  getAllFirms);
router.get('/removeFirm', isLoggedIn, isAdmin, removeFirm);
router.post('/AddCustomer', isLoggedIn, AddCustomer);
router.get('/getAllCustomers', isLoggedIn, getAllCustomers);
router.get('/removeCustomer', isLoggedIn, isStaff, removeCustomer);
router.post('/createStockCategory', isLoggedIn, isAdmin, upload.single('CategoryImg'), createStockCategory); 
router.get('/getAllStockCategories', isLoggedIn, getAllStockCategories);
router.get('/removeStockCategory', isLoggedIn, removeStockCategory);
router.post('/AddStock', isLoggedIn, upload.single('stock'), AddStock);
router.get('/getAllStocks', isLoggedIn, getAllStocks);
router.get('/removeStock', isLoggedIn, removeStock);
router.get('/GetstockbyCategory', isLoggedIn, GetstockbyCategory);
router.get('/GetstockbyFirm', isLoggedIn, GetstockbyFirm);

module.exports = router;
