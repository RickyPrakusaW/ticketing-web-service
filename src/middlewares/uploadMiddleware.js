const multer = require("multer");
const path = require("path");

// 1. Tentukan tempat penyimpanan dan penamaan file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    // Menggunakan ID pengguna jika ada, jika tidak gunakan suffix acak
    const prefix = req.user ? req.user._id : "guest";
    cb(null, `avatar-${prefix}-${uniqueSuffix}${ext}`);
  },
});

// 2. Filter tipe file (Hanya mengizinkan gambar)
const fileFilter = (req, file, cb) => {
  // Verifikasi ekstensi file secara ketat
  const extName = /^\.(jpg|jpeg|png|gif|webp)$/.test(
    path.extname(file.originalname).toLowerCase(),
  );

  // Izinkan jika tipe mime dimulai dengan 'image/' atau berupa 'application/octet-stream' (default deteksi di beberapa HTTP Client/Postman)
  const mimeType =
    file.mimetype.startsWith("image/") ||
    file.mimetype === "application/octet-stream";

  if (extName && mimeType) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Hanya file gambar (jpg, jpeg, png, gif, webp) yang diperbolehkan!",
      ),
      false,
    );
  }
};

// 3. Konfigurasi instance upload multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // Batas maksimal ukuran file (2MB)
  },
});

module.exports = upload;
