const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Route untuk Register dan Login
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/verify-otp", authController.verifyOTP);
router.post("/resend-otp", authController.resendOTP);

module.exports = router;
