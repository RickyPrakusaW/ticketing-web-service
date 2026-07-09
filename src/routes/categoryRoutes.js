const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// CRUD Categories
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["Admin", "HotelManager"]),
  categoryController.createCategory,
);
router.get("/", categoryController.getCategories);
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["Admin", "HotelManager"]),
  categoryController.updateCategory,
);
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["Admin", "HotelManager"]),
  categoryController.deleteCategory,
);

module.exports = router;
