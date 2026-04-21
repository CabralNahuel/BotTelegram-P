const { DataTypes } = require('sequelize');
const { db } = require('../conexionDB/conexionDB');

const TemaMd = db.define(
  "tema",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    idmenu: {
      type: DataTypes.INTEGER,
      field: "idmenu",
      references: {
        model: 'menu', 
        key: 'id',
      },
    },
    tema: {
      type: DataTypes.STRING,
      field: "tema",
      allowNull: true,
    },
    comando_tema: {
      type: DataTypes.STRING,
      field: "comando_tema",
      allowNull: true,
    },
    
    eliminado: {
      type: DataTypes.INTEGER,
      field: "eliminado",
      allowNull: true,
    }
  },
  {
    paranoid: true,
    freezeTableName: true,
    timestamps: false,
  }
);

module.exports = TemaMd;
