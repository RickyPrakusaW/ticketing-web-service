const { Op, Sequelize } = require("sequelize");
const { Buku, KategoriBuku, Toko, Pengguna } = require("../models");
const userSchema = require("../utils/validation/userSchema");
const customSchema = require("../utils/validation/customSchema");
const { default: axios } = require("axios");

const fetchBuku = async (req, res) => {
  let result;
  const keyword = "j";
  const tahun_terbit_awal = 1800;
  const tahun_terbit_akhir = 2077;
  const panjang = 5;
  // select buku_nama,buku_tahun_terbit
  // from buku_nama like "%jojo%"
  // or (buku_tahun_terbit >= 2000
  // and buku_tahun_terbit <= 2077
  // and kategori_id is not null)

  result = await Buku.findAll({
    attributes: [
      "buku_nama",
      "buku_tahun_terbit",
      [Sequelize.literal("UPPER(buku_nama)"), "buku_nama_buesar"],
      [Sequelize.literal("KategoriBuku.kategori_nama"), "kategori_nama"],
    ],
    include: [
      {
        model: KategoriBuku,
        attributes: [],
      },
    ],
    limit: 3,
    offset: 1,
    order: [
      ["buku_tahun_terbit", "desc"],
      ["buku_nama", "desc"],
    ],
    replacements: {
      panjang: Number(panjang),
    },
    where: {
      [Op.or]: [
        { buku_nama: { [Op.like]: `%${keyword}%` } },
        {
          [Op.and]: [
            {
              buku_tahun_terbit: {
                [Op.gte]: Number(tahun_terbit_awal),
                [Op.lte]: Number(tahun_terbit_akhir),
              },
            },
            { kategori_id: { [Op.not]: null } },
          ],
        },
        Sequelize.literal("LENGTH(buku_nama) > :panjang"),
      ],
    },
  });

  return res.status(200).json(result);
};

const getBuku = async (req, res) => {
  const { buku_id } = req.params;
  const result = await Buku.findByPk(buku_id);
  return res.status(200).json(result);
};

const insertBuku = async (req, res) => {
  const { buku_nama, buku_tahun_terbit, kategori_id } = req.body;
  try {
    // const result = await Buku.create(req.body); // cara cepat
    const result = await Buku.create({
      buku_nama,
      buku_tahun_terbit,
      kategori_id,
    });
    if (result) {
      return res
        .status(200)
        .json({ pesan: `Berhasil insert buku id : ${result.buku_id}` });
    }
  } catch (error) {}
};

const updateBuku = async (req, res) => {
  const { buku_id } = req.params;
  const { buku_nama, buku_tahun_terbit, kategori_id } = req.body;
  const bukuYangAkanDiUbah = await Buku.findByPk(buku_id);

  if (buku_nama == "" || buku_nama == undefined) {
    return res.status(500).json("buku nama wajib ada");
  }

  if (!bukuYangAkanDiUbah) {
    return res.status(404).json("Buku tidak ditemukan");
  }

  // seandainya ketemu
  // WAJIB PAKAI VARIBLE BUKU YANG MAU DIUPDATE, JANGAN PAKAI MODEL Buku
  await bukuYangAkanDiUbah.update({
    buku_nama,
    buku_tahun_terbit,
    kategori_id,
  });
  return res.status(200).json("Berhasil update");
};

const deleteBuku = async (req, res) => {
  const { buku_id } = req.params;
  const bukuYangAkanDihapus = await Buku.findByPk(buku_id);

  if (!bukuYangAkanDihapus) {
    return res.status(404).json("Buku tidak ditemukan");
  }

  // seandainya ketemu
  // WAJIB PAKAI VARIBLE BUKU YANG MAU DIUPDATE, JANGAN PAKAI MODEL Buku
  await bukuYangAkanDihapus.destroy();
  return res.status(200).json("Berhasil didelete");
};

const onetoone = async (req, res) => {
  // eager loading
  const { toko_id } = req.params;
  // const result = await Toko.findByPk(Number(toko_id), {
  //   attributes: [
  //     "toko_nama",
  //     [Sequelize.literal("Pengguna.pengguna_nama"), "pengguna_nama"],
  //   ],
  //   include: [{ model: Pengguna, attributes: ["pengguna_nama"] }],
  // });
  // return res.status(200).json(result);

  // lazy loading
  const toko = await Toko.findByPk(Number(toko_id));
  // misalnya melakukan hal-hal lain dulu
  return res.status(200).json({
    toko: toko,
    ownernya: await toko.getPengguna(),
    bukunya: await toko.getBuku({
      attributes: ["buku_nama"],
      order: [["buku_nama", "desc"]],
    }),
  });
};

const manytomany = async (req, res) => {
  const { toko_id } = req.params;
  const toko = await Toko.findByPk(Number(toko_id), {
    include: [
      {
        model: Buku,
        attributes: [
          "buku_nama",
          [
            Sequelize.literal("`Buku->KategoriBuku`.kategori_nama"),
            "kategori_nama",
          ],
          [Sequelize.literal("`Buku->toko_buku`.tb_stok"), "tb_stok"],
        ],
        include: [{ model: KategoriBuku, attributes: [] }],
        through: {
          attributes: [], // sembunyikan semua kolom dari tabel pivot
        },
      },
    ],
  });
  return res.status(200).json(toko);
};

const crudrelasi = async (req, res) => {
  // const kategori = await KategoriBuku.findByPk(1);
  // // Jojo, 10000 maka otomatis, kategori_id dikasi nilai 1
  // await kategori.createBuku(req.body);
  // return res.status(200).json("sukses");

  const toko = await Toko.findByPk(4);
  const buku = await Buku.findByPk(1);
  console.log(toko);

  // contoh insert ke tabel pivot
  // toko menambah buku apa? buku
  await toko.addBuku(buku, {
    through: { tb_stok: 100 },
  });

  // update jumlah stok
  await toko.setBuku(buku, {
    through: { tb_stok: 420 },
  });

  // untuk hapus data dari pivot
  // ini soft delete!
  await toko.removeBuku(buku);

  return res.status(200).json("crud relasi berhasil");
};

const contohvalidasi = async (req, res) => {
  try {
    const inputan = await userSchema.validateAsync(req.body, {
      abortEarly: false,
    });
    // nanti ada masukin inputan ke database
    // await Orang.create(inputan)
    return res.status(200).json(inputan);
  } catch (error) {
    const hasilError = error.details.reduce((hasil, item) => {
      const key = item.context.key ?? item.context.main;
      if (key in hasil) {
        hasil[key].push(item.message);
      } else {
        hasil[key] = [item.message];
      }
      return hasil;
    }, {});
    return res.status(400).json(hasilError);
  }
};

// {
//   "pengguna_username": ["username kosong","username"],
//   "pengguna_username": ["username kosong","username"],
// }

/**
 * {
 *  pengguna_username : ["username kosong"]
 * }
 */

const validasiCustom = async (req, res) => {
  try {
    const inputan = await customSchema.validateAsync(req.body);
    return res.status(200).json(inputan);
  } catch (error) {
    return res.status(400).json(error);
  }
};

const queryAnime = async (req, res) => {
  //https://api.jikan.moe/v4/anime/?q=jojo
  const perintah = await axios.get(`https://api.jikan.moe/v4/anime/`, {
    params: {
      q: "jojo",
    },
  });
  console.log(perintah.status);
  console.log(perintah.statusText);
  const hasilPerintah = perintah.data; // ini untuk ambil datanya, INI WAJIB
  // KHUSUS UNTUK JIKAN, karena kembaliannya adalah object yang berisi data dan pagination maka
  const data = hasilPerintah.data; // ini sesuai dengan api nya
  const result = data.map((item) => {
    return {
      judul: item.title,
      trailernya: item.trailer.url,
      sinonim: item.title_synonyms[0],
    };
  });
  return res.status(200).json(result);
};

const contohRestfulPost = async (req, res) => {
  const { koleksi_nama, barang_nama, barang_harga, barang_tahun } = req.body;
  const RESTFUL_API_DEV_KEY = process.env.RESTFUL_API_DEV_KEY;
  const url = `https://api.restful-api.dev/collections/${koleksi_nama}/objects`;
  const headerOpts = {
    headers: {
      "x-api-key": RESTFUL_API_DEV_KEY,
      "Content-Type": "application/json",
    },
  };

  const response = await axios.post(
    url,
    {
      name: barang_nama,
      data: {
        year: barang_tahun,
        price: barang_harga,
      },
    },
    headerOpts,
  );
  console.log(response.status);
  console.log(response.statusText);

  return res.status(200).json(response.data);
};

module.exports = {
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
};
