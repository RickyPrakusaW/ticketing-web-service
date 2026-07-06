const express = require("express");
const router = express.Router();
const {
  fetchBuku,
  getBuku,
  insertBuku,
  updateBuku,
  deleteBuku,
  onetoone,
  manytomany,
  crudrelasi,
  contohvalidasi,
  validasiCustom,
  queryAnime,
  contohRestfulPost,
} = require("../controllers/bukuORM");

router.get("/", fetchBuku);
router.get("/:buku_id", getBuku);
router.post("/", insertBuku);
router.put("/:buku_id", updateBuku);
router.delete("/:buku_id", deleteBuku);
// contoh relasi menggunakan lazy loading
router.get("/onetoone/toko/:toko_id", onetoone);
router.get("/manytomany/toko/:toko_id", manytomany);
router.post("/crudrelasi", crudrelasi);
// numpan validasi
router.post("/contohvalidasi", contohvalidasi);
router.post("/customvalidasi", validasiCustom);
router.post("/contohjikan", queryAnime);
// numpang axios dengan api key
router.post("/contoh/restful/post", contohRestfulPost);

module.exports = router;
