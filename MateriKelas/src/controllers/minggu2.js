let buku = require("../data/buku");

const queryBuku = (req, res) => {
  // misal url localhost:3000/api/v1/minggu2?keyword=a&rating=5
  const { keyword, rating } = req.query;

  // buku berjudul title dengan harga price
  // const result = buku.map((item) => {
  //   return `buku judul ${item.title} dengan harga ${item.price}`;
  // });

  // buku berjudul title dengan harga price
  // const result = buku.map(
  //   (item) => `buku judul ${item.title} dengan harga ${item.price}`,
  // );

  // find
  // const result = buku.find((item) => {
  //   return item.title.includes(keyword);
  // });

  // find
  // const result = buku.find((item) => item.title.includes(keyword));

  // filter
  // const result = buku.filter((item) => {
  //   return !item.title.includes(keyword);
  // });

  // reduce
  const result = buku.reduce((hasil, item) => {
    // return hasil + item.price;
    return hasil.price > item.price ? hasil : item;
  }, {});

  return res.json({
    pencarian: {
      keyword,
      rating,
    },
    hasil: result,
  });
};

const getSingleBuku = (req, res) => {
  // localhost:3000/api/v1/minggu2/:bukuId/char/:charnya
  const { bukuId, charnya } = req.params;
  return res.json({
    bukuId,
    charnya,
  });
};

const storeBuku = (req, res) => {
  const { title, price, image, desc } = req.body;
  return res.json({ title, price, image, desc });
};

module.exports = {
  queryBuku,
  getSingleBuku,
  storeBuku,
};
