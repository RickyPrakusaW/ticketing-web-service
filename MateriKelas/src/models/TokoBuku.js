"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class TokoBuku extends Model {
    static associate(models) {}
  }
  TokoBuku.init(
    {
      tb_stok: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "toko_buku",
      tableName: "toko_buku",
      timestamps: true,
      paranoid: true,
      name: {
        singular: "TokoBuku",
        plural: "TokoBuku",
      },
    },
  );
  return TokoBuku;
};
