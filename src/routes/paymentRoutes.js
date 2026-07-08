const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");

// Endpoint publik untuk menerima callback notifikasi status dari Midtrans
router.post("/webhook", paymentController.handleWebhook);

module.exports = router;
