const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { Pengguna } = require("../models");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  // 1. Minta data dari user
  const { pengguna_nama, pengguna_jk, pengguna_password } = req.body;

  // 2. Hash dulu password nya
  const hashedPassword = await bcrypt.hash(pengguna_password, 10);

  // 3. OPTIONAL, asumsikan kita butuh buat api key untuk user pakai di koding mereka
  const apikey = await crypto.randomUUID();

  // 4. Tinggal Insert ke database
  const result = await Pengguna.create({
    pengguna_nama,
    pengguna_jk,
    pengguna_password: hashedPassword,
    roles: "visitor",
    api_key: apikey,
  });

  return res.status(200).json(result);
};
const login = async (req, res) => {
  // 1. Minta pengguna_nama dan pengguna_password
  const { pengguna_nama, pengguna_password } = req.body;

  // 2. cek dulu pengguna nama dan password harus ada
  if (!pengguna_nama || !pengguna_password) {
    return res.status(400).json("Silakan masukkan nama dan password");
  }

  // 3. cari dulu usernya, pengecekan password itu NANTI KARENA KITA HASH
  const pengguna = await Pengguna.findOne({
    where: { pengguna_nama: pengguna_nama },
    attributes: [
      "pengguna_id",
      "pengguna_nama",
      "pengguna_jk",
      "pengguna_password",
      "roles",
    ],
  });

  // 4. cek dulu penggunanya ada atau tidak
  if (!pengguna) {
    return res.status(401).json("Gagal Login");
  }

  // 5. cek passwordnya valid atau tidak
  // HATI-HATI JANGAN SAMPAI TERTUKAR, PASSWORD INPUTAN VS PASSWORD DI DATABASE
  const cekPassword = await bcrypt.compare(
    pengguna_password,
    pengguna.pengguna_password,
  );

  // 6. JIKA PENGECEKAN BERHASIL / GAGAL
  if (cekPassword) {
    //  kalau password cocok
    // 7. PENTING! HARUS HILANGKAN SEMUA INFORMASI PENTING
    pengguna.pengguna_password = undefined; // buang informasi password dari pengguna hasil database

    // 8. buat access token
    const accessToken = jwt.sign(
      { pengguna },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "30s",
      },
    );

    // 9. buat refresh token
    const refreshToken = jwt.sign(
      { pengguna },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1m" },
    );

    // 10. refresh token DISIMPAN DI-DATABASE
    // Optional, kalau tidak disuruh simpan database ya gausah
    const updatePengguna = await Pengguna.findByPk(pengguna.pengguna_id);
    await updatePengguna.update({
      refresh_token: refreshToken,
    });

    // 11. refresh token disimpan cookie
    // HATI-HATI INI RES BUKAN REQ
    res.cookie("rtsaya", refreshToken, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // hasil ini adalah 1 hari (1000 itu adalah 1000 milisecond)
    });

    // 12. return itu paling terakhir
    return res
      .status(200)
      .json({ pesan: "Berhasil login", token: accessToken });
  } else {
    // kalau password salah
    return res.status(401).json("Gagal Login");
  }
};
const refresh = async (req, res) => {
  // 1. cari dulu refresh token yang disimpan di cookie kita
  const cookies = req.cookies;

  // 2. pastikan cookie kita menyimpan / memiliki refresh token kita
  if (!cookies?.rtsaya) {
    // kalau cookie tidak memiliki refrsh token kita, maka tolak permintaan untuk refresh
    // return res.sendStatus(401);
    return res.status(401).json("Cookie kosong");
  }

  // 3. cookie rtsaya ketemu, masukkan ke variable
  const refreshToken = cookies.rtsaya;

  // 4. Pengecekan #1 (optional), cek di database, apakah ada user yang punya refresh token yang sama
  // Lihat TIDAK ADA data confidential seperti password sini
  const pengguna = await Pengguna.findOne({
    where: { refresh_token: refreshToken },
    attributes: ["pengguna_id", "pengguna_nama", "pengguna_jk", "roles"],
  });
  if (!pengguna) {
    // tidak ditemukan pengguna dengan refresh token yang diberikan, TOLAK
    // return res.sendStatus(401);
    return res.status(401).json("Kamu siapa?");
  }

  /**
   * 5. verify jwt nya, yang diverifikasi adalah
   * - Expired atau tidak
   * - Signature-nya benar atau salah
   */
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err || pengguna.pengguna_id != decoded.pengguna.pengguna_id) {
      // kalau error, atau hasil dari decode jwt refresh token tidak cocok dengan data di database
      // return res.sendStatus(401);
      return res.status(401).json("verifikasi token gagal");
    }

    // 6. kalau aman (tidak expired, tidak dipalsukan), maka buatlah access token yang baru
    const accessToken = jwt.sign(
      { pengguna },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "30s",
      },
    );
    return res.status(200).json({ token: accessToken });
  });
};

const logout = async (req, res) => {
  // 1. cari dulu refresh token yang disimpan di cookie kita
  const cookies = req.cookies;

  // 2. pastikan cookie kita menyimpan / memiliki refresh token kita
  if (!cookies?.rtsaya) {
    // cookie ga ada? kerjaan selesai, tidak perlu ngapa2in
    return res.sendStatus(204);
  }

  // 3. kalau cookie ada, maka tangkap dulu
  const refreshToken = cookies.rtsaya;

  // 4. cari pengguna yang punya rt yang sama di database, lalu kosongkan dari database
  const pengguna = await Pengguna.findOne({
    where: { refresh_token: refreshToken },
  });
  if (pengguna) {
    // kalau di database ketemu 1 orang dengan refresh token yang sama dengan cookie
    await pengguna.update({ refresh_token: null });
  }

  // 5. Hapus dulu cookie nya
  res.clearCookie("rtsaya", { httpOnly: true });

  // 6. jangan lupa return
  return res.sendStatus(204);
};

module.exports = {
  register,
  login,
  refresh,
  logout,
};
