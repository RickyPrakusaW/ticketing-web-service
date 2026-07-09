const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

// Endpoint untuk mengambil detail profil user (semua role wajib login)
router.get("/profile", authMiddleware, userController.getProfile);

// Endpoint untuk upload/update foto profil user (multipart/form-data, key: "avatar")
router.put(
  "/profile/avatar",
  authMiddleware,
  upload.single("avatar"),
  userController.updateAvatar,
);

// Endpoint untuk menghapus foto profil (avatar) (wajib login)
router.delete("/profile/avatar", authMiddleware, userController.deleteAvatar);

// Endpoint untuk menonaktifkan/menghapus akun profil user (Soft Delete) (wajib login)
router.delete("/profile", authMiddleware, userController.deleteAccount);

module.exports = router;
