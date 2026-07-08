const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

// Endpoint untuk mengambil detail profil user (semua role wajib login)
router.get("/profile", authMiddleware, userController.getProfile);

module.exports = router;
