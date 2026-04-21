const { DataTypes } = require('sequelize');
const {db} = require('../conexionDB/conexionDB');


const ComandoMd = db.define(
    "menu",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      titulo: {
        type: DataTypes.STRING,
        field: "titulo",
        allowNull: true,
      }  },
    {
      paranoid: true,
      freezeTableName: true,
      timestamps: false,
    }
  );
  
  module.exports = ComandoMd;
