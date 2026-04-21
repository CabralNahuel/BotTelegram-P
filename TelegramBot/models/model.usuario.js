const { DataTypes } = require('sequelize');
const { db } = require('../conexionDB/conexionDB');

const UsuarioMd = db.define(
  "usuario",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    historial: {
      type: DataTypes.JSON,
      field: "historial",
      allowNull: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  },
  {
    paranoid: true,
    freezeTableName: true,
    timestamps: false,
  }
);

module.exports = UsuarioMd;
