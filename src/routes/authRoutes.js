const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const validate = require("../middlewares/validateMiddleware");
const {
  registerSchema,
  loginSchema,
} = require("../validations/authValidation");

// Route untuk Register dan Login dengan Validasi Payload Joi
router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post("/verify-otp", authController.verifyOTP);
router.post("/resend-otp", authController.resendOTP);

module.exports = router;
