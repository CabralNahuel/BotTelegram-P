const { DataTypes } = require('sequelize');
const { db } = require('../conexionDB/conexionDB');
const TemaMd = require('./model.tema');

const MensajesMd = db.define(
  "mensajes",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    idtema: {
      type: DataTypes.INTEGER,
      field: "idtema",
      allowNull: false,
    },
    mensaje: {
      type: DataTypes.TEXT,
      field: "mensaje",
      allowNull: true,
    },
    actualizacion: {
      type: DataTypes.STRING,
      field: "actualizacion",
      allowNull: true,
    },
    eliminado: {
      type: DataTypes.INTEGER,
      field: "eliminado",
      allowNull: true,
    }
    ,
    etiqueta: {
      type: DataTypes.JSON,
      field: "etiqueta",
      allowNull: true,
    }
  },
  {
    paranoid: true,
    freezeTableName: true,
    timestamps: false,
  }
);

MensajesMd.belongsTo(TemaMd, { foreignKey: 'idtema', as: 'tema' });

module.exports = MensajesMd;
