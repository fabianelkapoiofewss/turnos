import { sequelize } from "../database/config.js";
import { DataTypes } from "sequelize";

export const Videos = sequelize.define("Videos", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    archivo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    tipo_mime: {
        type: DataTypes.STRING,
        allowNull: false
    },
    tamaño: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    activo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    orden: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
},
{
    tableName: "videos",
    timestamps: true
});