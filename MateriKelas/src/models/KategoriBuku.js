"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class KategoriBuku extends Model {
    static associate(models) {
      KategoriBuku.hasMany(models.Buku, {
        foreignKey: "kategori_id", // FK di tabel Buku
        sourceKey: "kategori_id", // PK di tabel Buku
      });
    }
  }
  KategoriBuku.init(
    {
      kategori_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      kategori_nama: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: "kategori_buku",
      tableName: "kategori_buku",
      paranoid: true,
      name: {
        singular: "KategoriBuku",
        plural: "KategoriBuku",
      },
    },
  );
  return KategoriBuku;
};
// hati2, singular dan plural akan di gunakan sebagai alias ketika kalian melakukan include
