require("dotenv").config();
console.log("usernya" + process.env.DB_USER);

module.exports = {
  koneksi_buku: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    pass: process.env.DB_PASS,
    database: process.env.DB_DBNAME,
    port: process.env.DB_PORT,
    dialect: "mysql",
  },
};
