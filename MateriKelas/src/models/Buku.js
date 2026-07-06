"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Buku extends Model {
    static associate(models) {
      Buku.belongsTo(models.KategoriBuku, {
        foreignKey: "kategori_id", // fk ditabel buku
        targetKey: "kategori_id", // pk ditabel kategori
      });

      Buku.belongsToMany(models.Toko, {
        through: models.TokoBuku,
        foreignKey: "buku_id", // many to many, maka foreignkey menunjuk ke diri sendiri
        otherKey: "toko_id", // other key adalah yang lainnya
      });
    }
  }
  Buku.init(
    {
      buku_id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      buku_nama: {
        type: DataTypes.STRING,
        allowNull: false, // not null
        unique: true,
      },
      buku_tahun_terbit: {
        type: DataTypes.INTEGER(4),
      },
      kategori_id: {
        type: DataTypes.BIGINT,
      },
    },
    {
      sequelize,
      modelName: "buku", // nama model menurut sequelize
      tableName: "buku", // nama tabel di database
      timestamps: true, // createdAt dan updatedAt
      paranoid: true, // deletedAt
      //   createdAt: "dibuat_kapan",
      //   updatedAt: "diubah_kapan",
      //   deletedAt: "dihapus_kapan",
      name: {
        singular: "Buku", // kategori.getBuku
        plural: "Buku", // kategori.getBuku
      },
    },
  );
  return Buku;
};
