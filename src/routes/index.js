const express = require("express");
const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const walletRoutes = require("./walletRoutes");
const paymentRoutes = require("./paymentRoutes");
const categoryRoutes = require("./categoryRoutes");
const voucherRoutes = require("./voucherRoutes");
const hotelRoutes = require("./hotelRoutes");
const bookingRoutes = require("./bookingRoutes");
const bookingController = require("../controllers/bookingController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// Jalur Utama yang Sudah Siap (Auth, User Profile, E-Wallet, Webhook)
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/wallets", authMiddleware, walletRoutes);
router.use("/payments", paymentRoutes);

// Jalur Placeholder/Roadmap (Category, Voucher, Hotel, Booking, Reviews, Check-In)
router.use("/categories", categoryRoutes);
router.use("/vouchers", voucherRoutes);
router.use("/hotels", hotelRoutes);
router.use("/bookings", bookingRoutes);

// Jalur Health Check
router.get("/health", bookingController.healthCheck);

module.exports = router;
