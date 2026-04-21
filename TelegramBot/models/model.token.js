const { DataTypes } = require('sequelize');
const { db } = require('../conexionDB/conexionDB');

const TokenMd = db.define(
    "token",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
        },
        token:{
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

module.exports = TokenMd;
