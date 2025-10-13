import { initializeDatabase } from './src/database/init-db.js';

const run = async () => {
    try {
        await initializeDatabase({ createDefaultAdmin: true });
        console.log('\n🎉 Base de datos inicializada correctamente!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error al inicializar la DB:', err);
        process.exit(1);
    }
};

run();