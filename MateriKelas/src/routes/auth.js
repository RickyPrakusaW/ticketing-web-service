const express = require("express");
const { register, logout, login, refresh } = require("../controllers/auth");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/refresh", refresh);
router.get("/logout", logout);

module.exports = router;
