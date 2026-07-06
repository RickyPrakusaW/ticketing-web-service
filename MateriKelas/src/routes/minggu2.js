const express = require("express");
const router = express.Router();
const {
  queryBuku,
  getSingleBuku,
  storeBuku,
} = require("../controllers/minggu2");

// localhost:3000/api/v1/minggu2?keyword=a&rating=5
router.get("/", queryBuku);

// localhost:3000/api/v1/minggu2/:bukuId/char/charnya
router.get("/:bukuId/char/:charnya", getSingleBuku);

router.post("/", storeBuku);

// // localhost:3000/api/v1/minggu2/cari
// router.get("/cari", queryBuku);

module.exports = router;

/**
 * 
 * Setup awal untuk semua router
 * 
const express = require("express");
const router = express.Router();

module.exports = router;
 * 
 * 
 */
