"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ApiTierlist extends Model {
    static associate(models) {}
  }
  ApiTierlist.init(
    {
      api_tier: {
        type: DataTypes.STRING,
        primaryKey: true,
        autoIncrement: false,
      },
      api_limit: {
        type: DataTypes.INTEGER,
      },
      api_quota: {
        type: DataTypes.INTEGER,
      },
    },
    {
      sequelize,
      modelName: "api_tierlist",
      tableName: "api_tierlist",
      paranoid: true,
      name: {
        singular: "ApiTierList",
        plural: "ApiTierList",
      },
      timestamps: false,
    },
  );
  return ApiTierlist;
};
