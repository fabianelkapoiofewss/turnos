import { sequelize } from "./src/database/config.js";
import { Turnos } from "./src/models/turnos.js";
import { Videos } from "./src/models/videos.js";
import { Usuarios } from "./src/models/usuarios.js";

async function inicializarDB() {
    try {
        console.log('🔄 Conectando a la base de datos...');
        await sequelize.authenticate();
        console.log('✅ Conexión establecida correctamente.');

        console.log('🔄 Sincronizando modelos...');
        await sequelize.sync({ force: false });
        console.log('✅ Modelos sincronizados correctamente.');

        // Crear usuario super admin por defecto si no existe
        const adminExistente = await Usuarios.findOne({ where: { username: 'admin' } });
        
        if (!adminExistente) {
            console.log('🔄 Creando usuario super admin...');
            await Usuarios.create({
                username: 'admin',
                password: 'admin123', // Se hashea automáticamente
                role: 'super_admin'
            });
            console.log('✅ Usuario super admin creado:');
            console.log('   Username: admin');
            console.log('   Password: admin123');
            console.log('   ⚠️  CAMBIAR LA CONTRASEÑA EN PRODUCCIÓN');
        } else {
            console.log('ℹ️  Usuario super admin ya existe');
        }

        console.log('\n🎉 Base de datos inicializada correctamente!');
        console.log('\n📋 Resumen:');
        console.log('• Tablas: turnos, videos, usuarios');
        console.log('• Super Admin: admin / admin123');
        console.log('• Operadores: Acceso directo sin login');
        console.log('\n🌐 URLs de acceso:');
        console.log('• Pantalla Principal: http://localhost:5173');
        console.log('• Panel Operador: http://localhost:5173/#/operador (sin login)');
        console.log('• Panel Super Admin: http://localhost:5173/#/login (requiere admin)');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error al inicializar la base de datos:', error);
        process.exit(1);
    }
}

inicializarDB();