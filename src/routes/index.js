const express = require("express");
const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const walletRoutes = require("./walletRoutes");
const paymentRoutes = require("./paymentRoutes");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/wallets", authMiddleware, walletRoutes);
router.use("/payments", paymentRoutes);

module.exports = router;
