// Pengguna ID
// Toko pengguna_id

"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Pengguna extends Model {
    static associate(models) {
      // Saya berpacaran dengan Si Dia, buktinya apa
      Pengguna.hasOne(models.Toko, {
        foreignKey: "pengguna_id", // menunjuk ke FOREIGN KEY di tabel Toko
        sourceKey: "pengguna_id", // menunjuk ke Primary Key di tabel Pengguna
      });
    }
  }
  Pengguna.init(
    {
      pengguna_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      pengguna_nama: {
        type: DataTypes.STRING,
      },
      pengguna_jk: {
        type: DataTypes.ENUM(["pria", "wanita"]),
      },
      pengguna_password: {
        type: DataTypes.TEXT,
      },
      api_key: {
        type: DataTypes.TEXT,
      },
      refresh_token: {
        type: DataTypes.TEXT,
      },
      roles: {
        type: DataTypes.TEXT,
      },
      api_level: {
        type: DataTypes.TEXT,
      },
      api_quota: {
        type: DataTypes.INTEGER,
      },
    },
    {
      sequelize,
      modelName: "pengguna",
      tableName: "pengguna",
      paranoid: true,
      name: {
        singular: "Pengguna",
        plural: "Pengguna",
      },
    },
  );
  return Pengguna;
};
