const fs = require("fs");
const { Pengguna } = require("../models");

const singleFile = async (req, res) => {
  return res.status(200).json("masuk");
};

const multiFile = async (req, res) => {
  console.log(req.body);
  console.log(req.files);

  // misal diujian disuruh sekalian daftar ke database
  await Pengguna.create({ pengguna_nama: req.body.pengguna_nama });

  return res.status(200).json("masuk dengan nama " + req.body.pengguna_nama);
};

const getProfpic = async (req, res) => {
  const { pengguna_nama } = req.query;
  const fileName = `uploads/${pengguna_nama}/profpic.jpg`;
  return res.sendFile(fileName, { root: "." });
};

const listFile = async (req, res) => {
  const { pengguna_nama } = req.query;
  const folderName = `uploads/${pengguna_nama}`;
  fs.readdir(folderName, (error, files) => {
    if (error) {
      return res.status(500).json(error);
    } else {
      return res.status(200).json(files);
    }
  });
};

const renameFile = async (req, res) => {
  const { pengguna_nama } = req.query;
  fs.renameSync(
    `uploads/${pengguna_nama}/profpic.jpg`,
    `uploads/${pengguna_nama}/profpic_new.jpg`,
  );
  return res.status(200).json("masuk");
};

const deleteFile = async (req, res) => {
  const { pengguna_nama } = req.query;
  const fileName = `uploads/${pengguna_nama}/profpic.jpg`;
  fs.unlinkSync(fileName);
  return res.status(200).json("masuk");
};

const coba = async (req, res) => {
  return res.status(200).json("masuk");
};

module.exports = {
  singleFile,
  multiFile,
  getProfpic,
  listFile,
  renameFile,
  deleteFile,
  coba,
};
