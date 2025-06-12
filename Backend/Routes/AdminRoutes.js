const express = require('express');
const router = express.Router();
const { isLoggedIn, isAdmin, isStaff } = require('../Utils/islogedin');
const { RegisterUser, GetAllUsers, removeUser, loginUser , logoutUser } = require('../Controllers/adminController');


router.post('/register', RegisterUser);
router.get('/GetallUsers', isLoggedIn, GetAllUsers);
router.get('/remove/:userId', removeUser);
router.post('/login', loginUser);
router.get('/logout', logoutUser);

module.exports = router;
