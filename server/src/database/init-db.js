import { sequelize } from "./config.js";
import { Turnos } from "../models/turnos.js";
import { Videos } from "../models/videos.js";
import { Usuarios } from "../models/usuarios.js";

/**
 * Inicializa la base de datos de forma idempotente.
 * - autentica la conexión
 * - sincroniza los modelos sin forzar
 * - crea un usuario super_admin por defecto solo si no existe
 */
export const initializeDatabase = async (options = {}) => {
    const { createDefaultAdmin = true } = options;
    try {
        console.log('🔄 Inicializando base de datos...');
        await sequelize.authenticate();
        console.log('✅ Conexión a la base de datos OK');

        // Sincronizar modelos (no force para evitar pérdida de datos)
        await sequelize.sync({ force: false });
        console.log('✅ Modelos sincronizados');

        if (createDefaultAdmin) {
            const adminUser = await Usuarios.findOne({ where: { username: 'admin' } });
            if (!adminUser) {
                console.log('🔐 Creando usuario super admin por defecto...');
                await Usuarios.create({
                    username: 'admin',
                    password: process.env.INIT_ADMIN_PASSWORD || 'admin123',
                    role: 'super_admin'
                });
                console.log('✅ Usuario super admin creado: username=admin');
                if (!process.env.INIT_ADMIN_PASSWORD) {
                    console.log('⚠️ Contraseña por defecto: admin123 (por seguridad, establecer INIT_ADMIN_PASSWORD en producción)');
                }
            } else {
                console.log('ℹ️ Usuario super admin ya existe, no se creará otro');
            }
        }

        return { success: true };
    } catch (error) {
        console.error('❌ Error inicializando la base de datos:', error);
        throw error;
    }
};
