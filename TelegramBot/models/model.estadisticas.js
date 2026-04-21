const { DataTypes } = require('sequelize');
const { db } = require('../conexionDB/conexionDB');

const EstadisticaMd = db.define(
    "estadisticas", {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    usuarioId: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
    comando: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    texto: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    // Columna en MySQL: suele ser `fecha_de_creacion` (si en tu BD se llama distinto, alineá el modelo o usá ESTADISTICAS_FECHA_COLUMN en rutas).
    fecha_de_creacion: {
        type: DataTypes.DATE,
        allowNull: true,
    },
},
    {
        freezeTableName: true, 
        timestamps: false,
    }
);

module.exports = EstadisticaMd;
