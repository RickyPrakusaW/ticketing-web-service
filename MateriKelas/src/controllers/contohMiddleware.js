const adminPage = async (req, res) => {
  return res.status(200).json(`Welcome admin, ${req.yanglogin.pengguna_nama}`);
};
const managerPage = async (req, res) => {
  return res
    .status(200)
    .json(`Welcome manager, ${req.yanglogin.pengguna_nama}`);
};
const visitorPage = async (req, res) => {
  return res
    .status(200)
    .json(`Welcome visitor, ${req.yanglogin.pengguna_nama}`);
};
const tesApiKey = async (req, res) => {
  return res.status(200).json(`ini tes api`);
};
const topup = async (req, res) => {
  if (req.yangpakai.api_level === "premium") {
    return res
      .status(200)
      .send(
        "Anda memiliki akun premium (tanpa sistem quota), kartu kredit anda akan ditagih selanjutnya pada tanggal ...",
      );
  } else {
    const quotaQuery = await ApiTierlist.findByPk(req.yangpakai.api_level);
    const quota = quotaQuery.api_quota;

    await req.yangpakai.increment({ api_quota: Number(quota) });

    const penggunaNow = await Pengguna.findByPk(req.yangpakai.pengguna_id);

    return res
      .status(200)
      .send(
        `Selamat, ${req.yangpakai.pengguna_nama}, quota anda bertambah ${quota} sehingga total quota anda sekarang adalah ${penggunaNow.api_quota}`,
      );
  }
};

module.exports = {
  adminPage,
  managerPage,
  visitorPage,
  tesApiKey,
  topup,
};
