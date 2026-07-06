const { QueryTypes } = require("sequelize");
const dbbuku = require("../databases/connectionBuku");

const fetchBuku = async (req, res) => {
  const { keyword, kategori_id } = req.query;
  const result = await dbbuku.query(
    "select * from buku where buku_nama like ? and kategori_id = ?",
    {
      type: QueryTypes.SELECT,
      replacements: [`%${keyword}%`, kategori_id],
    },
  );

  if (result.length <= 0) {
    return res.status(404).json("Buku todak ditemukan");
  }

  return res.status(200).json(result);
};
const getBuku = async (req, res) => {
  const { buku_id } = req.params;
  const result = await dbbuku.query(
    "select * from buku where buku_id = :buku_id",
    {
      type: QueryTypes.SELECT,
      replacements: {
        buku_id: Number(buku_id),
      },
    },
  );
  return res.status(200).json(result);
};
const insertBuku = async (req, res) => {
  const { buku_nama, buku_tahun_terbit, kategori_id } = req.body;
  const result = await dbbuku.query(
    "insert into buku(buku_nama,buku_tahun_terbit,kategori_id) values (?,?,?)",
    {
      type: QueryTypes.INSERT,
      replacements: [buku_nama, buku_tahun_terbit, kategori_id],
    },
  );
  console.log(result);
  return res.status(200).json(`Berhasil insert buku dengan id ${result[0]}`);
};

module.exports = {
  fetchBuku,
  getBuku,
  insertBuku,
};
