import { sequelize } from "./config.js";


export const connectDB = async () => {
    try {
        await sequelize.sync();
        console.log("Base de datos conectada");
    } catch (error) {
        console.error("Error al conectar a la base de datos:", error);
    }
}
