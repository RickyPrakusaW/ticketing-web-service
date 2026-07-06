// middleware itu program biasa yang ada ditengah2
// biasanya di antara route dan controller

/**
 * Tugas Middleware:
 * 1. Menolak request (redirect, abort, return error)
 * 2. Meneruskan request (next)
 * 3. Meneruskan request (next) + mengubah isinya
 */

// const verifyJWT = (iniparameter) => {
//   // wajib ada next kalau mau buat middleware
//   // 1. Menolak request (redirect, abort, return error)
//   // return res.status(401).json("Anda belum login");
//   // 2. Meneruskan request (next)
//   // next();
//   // 3. Meneruskan request (next) + mengubah isinya
//   // req.useryanglogin = "jojo";
//   // next();
//   // 4. Contoh khusus middleware dengan parameter
//   // return (req, res, next) => {
//   //   req.useryanglogin = iniparameter;
//   //   next();
//   // };
// };

const jwt = require("jsonwebtoken");

const verifyJWT = (req, res, next) => {
  // 1. Baca dulu datanya (header / cookie), tapi dalam contoh ini kita baca HEADER-NYA
  const authHeader = req.headers.authorization || req.headers.Authorization;

  // harapannya bentuknya Bearer 123123123
  // 2. Cek apakah isi header auth kita, itu dalam format Bearer <token>
  if (!authHeader?.startsWith("Bearer ")) {
    // tidak ada header auth nya atau kalaupun ada, tidak dalam format Bearer <token>
    return res.status(401).json("Header tidak ada");
  }

  // 3. Ambil tokennya (bentuknya : Bearer 123123123), maka untuk ambil tokennya saja, harus di split
  const accesstoken = authHeader.split(" ")[1];

  // 4. lakukan verifikasi access token
  jwt.verify(accesstoken, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    // kalau ada error
    if (err) {
      return res.status(401).json("Token tidak valid");
    }

    // kalau semua aman
    req.yanglogin = decoded.pengguna;
    // HATI-HATI KALAU KEPINGIN PROGRAMNYA LANJUT, MAKA WAJIB ADA next()
    next();
  });
};

module.exports = verifyJWT;
