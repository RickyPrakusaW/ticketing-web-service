const express = require("express");
const router = express.Router();
const hotelController = require("../controllers/hotelController");
const bookingController = require("../controllers/bookingController"); // For review endpoints
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// CRUD Hotels
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["Admin", "HotelManager"]),
  hotelController.createHotel,
);
router.get("/", hotelController.getHotels);
router.get("/:id", hotelController.getHotelById);
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["Admin", "HotelManager"]),
  hotelController.updateHotel,
);
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["Admin", "HotelManager"]),
  hotelController.deleteHotel,
);

// Room Type CRUD (Master #4)
router.post(
  "/:hotelId/rooms",
  authMiddleware,
  roleMiddleware(["Admin", "HotelManager"]),
  hotelController.createRoomType,
);
router.get("/:hotelId/rooms", hotelController.getRoomTypes);
router.put(
  "/:hotelId/rooms/:roomId",
  authMiddleware,
  roleMiddleware(["Admin", "HotelManager"]),
  hotelController.updateRoomType,
);
router.delete(
  "/:hotelId/rooms/:roomId",
  authMiddleware,
  roleMiddleware(["Admin", "HotelManager"]),
  hotelController.deleteRoomType,
);

// Reviews (GET)
router.get("/:hotelId/reviews", bookingController.getHotelReviews);

module.exports = router;
