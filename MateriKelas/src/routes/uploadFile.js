/**
 * Kalau mau pakai echo api, matthew bilang
 *
 * coba cek ... di body form-data, sebelah kanan dikit dari content-type
 * kalau di pencet aktifkan parameter type/required
 *
 * nanti bisa ganti tipenya jadi file
 *
 * HATI-HATI PASTIKAN PADA SAAT SETUP BODY FORM-DATA, inputan selain file harus ada di atas inputan file
 */

const express = require("express");
const {
  coba,
  singleFile,
  multiFile,
  getProfpic,
  listFile,
  renameFile,
  deleteFile,
} = require("../controllers/uploadFile");
const multer = require("multer");
const router = express.Router();
const fs = require("fs");
const path = require("path");

// cara upload paling gampang!
// ini kita akan langsung upload ke folder root project ini di dalam folder uploads
const uploadGampang = multer({ dest: "uploads/" });

let id = 1;
/**
 * Kalau butuh fitur yang lebih advanced seperti ganti nama file, berikan ext, cek mimetype/extension
 */
// 1. Buatkan KONFIGURASI penyimpanannya
const storageConfig = multer.diskStorage({
  destination: (req, file, callback) => {
    console.log(req.body);
    // 1. Bikin nama folder tujuan
    const folderName = `uploads/${req.body.pengguna_nama}`;

    // 2. cek dulu folder nya ada atau tidak, kalau tidak ada, mkdir!
    if (!fs.existsSync(folderName)) {
      // kalau tidak ada, maka buat dulu ya folder nya
      fs.mkdirSync(folderName, { recursive: true }); // mkdir -p
    }

    // 3. kalau semua sudah siap, maka jangan lupa callback (wajib ada)
    callback(null, folderName);
  },
  filename: (req, file, callback) => {
    console.log(file);
    // kalau langsung mau ganti nama
    // callback(null, "tes.jpg");

    // kalau mau dari nama originalName
    // callback(null, file.originalname);

    // kalau mau kita bikin nama sendiri tapi ttp pakai extension asli
    const fileExt = path.extname(file.originalname).toLowerCase();

    if (file.fieldname == "pengguna_pp") {
      // callback(null, `profpic${fileExt}`);
      callback(null, `profpic.jpg`);
    } else if (file.fieldname == "pengguna_files[]") {
      callback(null, `${id}${fileExt}`);
      id++;
    } else {
      callback(new Error("nama kolom aneh"), false);
    }
  },
});
// 2. Baru siapkan multer untuk upload filenya
const upload = multer({
  storage: storageConfig, // pasang konfigurasi penyimpanan kita
  limits: {
    fileSize: 20 * 1000 * 1000, // ini dalam bytes, 1000bytes = 1kb, 1000000 byte = 1mb
  },
  fileFilter: (req, file, callback) => {
    // pengecekan mime type / extension
    const filetypes = /jpeg|jpg|png|gif/;

    // cek extension
    const fileExt = path.extname(file.originalname).toLowerCase();
    const cekExt = filetypes.test(fileExt);

    // cek mimetype
    const cekMimetype = filetypes.test(file.mimetype);

    if (cekExt && cekMimetype) {
      callback(null, true);
    } else {
      callback(new Error("tipe salah"), false);
      // return callback(new Error("tipe salah"));
    }
  },
});

// router.post("/coba", [uploadGampang.single("pengguna_pp")], coba);
router.post("/coba", [upload.single("pengguna_pp")], coba);
router.post("/singlefile", singleFile);
router.post(
  "/multifile",
  [
    upload.fields([
      { name: "pengguna_pp", maxCount: 1 },
      { name: "pengguna_files[]", maxCount: 5 },
    ]),
  ],
  multiFile,
);
router.get("/profpic", getProfpic);
router.get("/list", listFile);
router.get("/rename", renameFile);
router.delete("/delete", deleteFile);

module.exports = router;
