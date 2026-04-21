const { DataTypes } = require('sequelize');
const { db } = require('../conexionDB/conexionDB');
const TemaMd = require('./model.tema');

const MenuesMd = db.define(
  "menu",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    titulo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    eliminado: {
      type: DataTypes.INTEGER,
    },
  },
  {
    paranoid: true,
    freezeTableName: true,
    timestamps: false,
  }
);

MenuesMd.hasMany(TemaMd, { as: 'tema', foreignKey: 'idmenu' });


module.exports = MenuesMd;
