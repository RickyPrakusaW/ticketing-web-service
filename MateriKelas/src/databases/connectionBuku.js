const Sequelize = require("sequelize");
const config = require("../config/config");

const { host, user, pass, port, database, dialect } = config.koneksi_buku;

const connectionBuku = new Sequelize(database, user, pass, {
  host,
  port,
  dialect,
});

module.exports = connectionBuku;
