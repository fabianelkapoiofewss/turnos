import { sequelize } from "../database/config.js";
import { DataTypes } from "sequelize";


export const Turnos = sequelize.define("Turnos", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    numero_turno: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    hora_llamado: {
        type: DataTypes.TIME,
        allowNull: true
    },
    estado: {
        type: DataTypes.ENUM('esperando', 'atendido', 'ausente', 'llamado'),
        allowNull: false,
        defaultValue: 'esperando'
    }
},
{
    tableName: "turnos",
    timestamps: true
});