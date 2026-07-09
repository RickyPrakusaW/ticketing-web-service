const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// Booking CRUD & Actions
router.post("/", authMiddleware, bookingController.createBooking);
router.get("/", authMiddleware, bookingController.getBookings);
router.get("/:id", authMiddleware, bookingController.getBookingById);
router.put("/:id/cancel", authMiddleware, bookingController.cancelBooking);
router.put(
  "/:id/refund",
  authMiddleware,
  roleMiddleware(["Admin"]),
  bookingController.refundBooking,
);

// Check-in / Check-out (Nilai Tambahan)
router.put(
  "/:id/checkin",
  authMiddleware,
  roleMiddleware(["Admin", "HotelManager"]),
  bookingController.checkIn,
);
router.put(
  "/:id/checkout",
  authMiddleware,
  roleMiddleware(["Admin", "HotelManager"]),
  bookingController.checkOut,
);

// Reviews (POST)
router.post(
  "/:bookingId/reviews",
  authMiddleware,
  bookingController.createReview,
);

module.exports = router;
