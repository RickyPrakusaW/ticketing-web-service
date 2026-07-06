const { DataTypes } = require("sequelize");
const connectionBuku = require("../databases/connectionBuku");
const Buku = require("./Buku");
const KategoriBuku = require("./KategoriBuku");
const Pengguna = require("./Pengguna");
const Toko = require("./Toko");
const TokoBuku = require("./TokoBuku");
const ApiLog = require("./ApiLog");
const ApiTierlist = require("./ApiTierlist");

const db = {};

db.Buku = Buku(connectionBuku, DataTypes);
db.KategoriBuku = KategoriBuku(connectionBuku, DataTypes);
db.Pengguna = Pengguna(connectionBuku, DataTypes);
db.Toko = Toko(connectionBuku, DataTypes);
db.TokoBuku = TokoBuku(connectionBuku, DataTypes);
db.ApiLog = ApiLog(connectionBuku, DataTypes);
db.ApiTierlist = ApiTierlist(connectionBuku, DataTypes);

// db[Buku].associate(db);
// db[KategoriBuku].associate(db);
// db[Pengguna].associate(db);
// db[Toko].associate(db);
for (const key of Object.keys(db)) {
  db[key].associate(db);
}

module.exports = db;
