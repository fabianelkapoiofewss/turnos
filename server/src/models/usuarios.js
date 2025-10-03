import { sequelize } from "../database/config.js";
import { DataTypes } from "sequelize";
import bcrypt from "bcrypt";

export const Usuarios = sequelize.define("Usuarios", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('operador', 'super_admin'),
        allowNull: false,
        defaultValue: 'operador'
    },
    activo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
},
{
    tableName: "usuarios",
    timestamps: true,
    hooks: {
        beforeCreate: async (usuario) => {
            if (usuario.password) {
                usuario.password = await bcrypt.hash(usuario.password, 10);
            }
        },
        beforeUpdate: async (usuario) => {
            if (usuario.changed('password')) {
                usuario.password = await bcrypt.hash(usuario.password, 10);
            }
        }
    }
});

// Método para verificar contraseña
Usuarios.prototype.verificarPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};