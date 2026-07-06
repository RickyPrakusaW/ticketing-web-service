const express = require("express");
const { fetchBuku, getBuku, insertBuku } = require("../controllers/bukuRaw");
const router = express.Router();

router.get("/", fetchBuku);
router.get("/:buku_id", getBuku);
router.post("/", insertBuku);

module.exports = router;
