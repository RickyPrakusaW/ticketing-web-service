const { Op } = require("sequelize");
const { Pengguna, ApiTierlist, ApiLog } = require("../models");
const checkApiKey = async (req, res, next) => {
  // 1. Ambil api key dari header
  const apikey = req.headers.apikey;

  // 2. Cek ada api key atau tidak
  if (!apikey) {
    return res.status(401).json("Tidak ada api key");
  }

  // 3. cek di database, ada tidak user dengan api key tersebut
  const pengguna = await Pengguna.findOne({ where: { api_key: apikey } });

  // 4. kalau pengguna tidak ditemukan, berarti api key salah / palsu
  if (!pengguna) {
    return res.status(401).json("Invalid API KEY");
  }

  // 5. catat siapa yang pakai ke dalam request, kalau sudah baru teruskan request
  req.yangpakai = pengguna;
  next();
};

const rateLimit = async (req, res, next) => {
  // 1. select * from api_tierlist dari api_level si yang pakai
  const tier = await ApiTierlist.findByPk(req.yangpakai.api_level);

  // 2. cek berapa kali usernya sudah melakukan penembakan selama 10 detik terakhir
  const count = await ApiLog.count({
    where: {
      pengguna_id: req.yangpakai.pengguna_id,
      createdAt: { [Op.gte]: Date.now() - 10 * 1000 },
    },
  });
  console.log(count);

  // 3. cek apakah penggunaan (count) telah melebihi api_limit, user PREMIUM tidak punya limit
  if (req.yangpakai.api_level !== "premium" && count >= tier.api_limit) {
    return res.status(429).json("Too Many Request");
  }

  // 4. kalau semua aman, maka lanjot
  next();
};

const logAccess = async (req, res, next) => {
  // 1. catat di log access
  await ApiLog.create({ pengguna_id: req.yangpakai.pengguna_id });
  // 2. lanjot
  next();
};

const cekQuota = async (req, res, next) => {
  // 1. lakukan pengecekan quota, masih bisa pakai tidak? ingat user Premium tidak kena limit quota
  if (req.yangpakai.api_level !== "premium" && req.yangpakai.api_quota <= 0) {
    return res.status(400).json("Quota sudah habis");
  }

  // 2. kalau lolos, lanjot
  next();
};
const kurangiQuota = async (req, res, next) => {
  // 1. langsung saja, kita kurangi kuota untuk NON-PREMIUM
  if (req.yangpakai.api_level !== "premium") {
    // update pengguna set api_quota=nilai sebelumnya - 1 where ......
    await req.yangpakai.increment({ api_quota: -1 });
  }

  // 2. lanjot
  next();
};

const middlewareApi = {
  checkApiKey,
  rateLimit,
  logAccess,
  cekQuota,
  kurangiQuota,
};

module.exports = middlewareApi;
