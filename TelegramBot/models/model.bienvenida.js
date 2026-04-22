const { DataTypes } = require('sequelize');
const {db} = require('../conexionDB/conexionDB');


const BienvenidaMd = db.define(
    "bienvenida",
    {
     textoBienvenida: {
        type: DataTypes.TEXT,
        field: "textoBienvenida",
        allowNull: true,
      }  },
    {
        timestamps: false,
        tableName: 'bienvenida',
    }
  );
  
  module.exports = BienvenidaMd;
