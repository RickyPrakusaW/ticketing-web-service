const express = require("express");
const router = express.Router();
const voucherController = require("../controllers/voucherController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// CRUD Vouchers
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["Admin", "HotelManager"]),
  voucherController.createVoucher,
);
router.get(
  "/",
  authMiddleware,
  roleMiddleware(["Admin", "HotelManager"]),
  voucherController.getVouchers,
);
router.get("/:code", authMiddleware, voucherController.getVoucherByCode);
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["Admin", "HotelManager"]),
  voucherController.updateVoucher,
);
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["Admin", "HotelManager"]),
  voucherController.deleteVoucher,
);

module.exports = router;
