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
router.post('/createFirm', isLoggedIn, isAdmin, upload.single('logo'), createFirm);
router.get('/getAllFirms', isLoggedIn,  getAllFirms);
router.get('/removeFirm', isLoggedIn, isAdmin, removeFirm);
router.post('/AddCustomer', isLoggedIn, isStaff, AddCustomer);
router.get('/getAllCustomers', isLoggedIn, getAllCustomers);
router.get('/removeCustomer', isLoggedIn, isStaff, removeCustomer);
router.post('/createStockCategory', isLoggedIn, isAdmin, upload.single('CategoryImg'), createStockCategory);
router.get('/getAllStockCategories', isLoggedIn, getAllStockCategories);
router.get('/removeStockCategory', isLoggedIn, removeStockCategory);


module.exports = router;
