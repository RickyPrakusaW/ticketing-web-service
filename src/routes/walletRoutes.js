const express = require("express");
const router = express.Router();
const walletController = require("../controllers/walletController");
const validate = require("../middlewares/validateMiddleware");
const { topupSchema } = require("../validations/walletValidation");

// Endpoint untuk mengambil detail saldo dan riwayat mutasi wallet (GET /wallets/)
router.get("/", walletController.getWallet);

// Endpoint untuk meminta Snap token top-up (POST /wallets/topup)
router.post("/topup", validate(topupSchema), walletController.requestTopup);

// Endpoint untuk membatalkan top-up yang pending (PUT /wallets/topup/:topupId/cancel)
router.put("/topup/:topupId/cancel", walletController.cancelTopup);

module.exports = router;
