const express = require('express');
const router = express.Router();
const { upload } = require("../Utils/UploadFile.js");
const { isLoggedIn, isAdmin, isStaff } = require('../Utils/islogedin');
const { RegisterUser, GetAllUsers, removeUser, loginUser , logoutUser ,createFirm , getAllFirms , removeFirm } = require('../Controllers/adminController');


router.post('/register', RegisterUser);
router.get('/GetallUsers', isLoggedIn, GetAllUsers);
router.get('/remove/:userId', removeUser);
router.post('/login', loginUser);
router.get('/logout', logoutUser);
router.post('/createFirm', isLoggedIn, isAdmin, upload.single('logo'), createFirm);
router.get('/getAllFirms', isLoggedIn, isAdmin, getAllFirms);
router.get('/removeFirm', isLoggedIn, isAdmin, removeFirm);

module.exports = router;
