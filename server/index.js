import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import dotenv from "dotenv";
import TurnosRouter from "./src/routes/turnos.route.js";
import { connectDB } from "./src/database/connection.js";

dotenv.config();

const app = express();

app.use(helmet());

// CORS configurado para desarrollo y producción
const allowedOrigins = [
    'http://localhost:5173', 
    'http://localhost:3000',
    // Agrega aquí tu dominio de Render cuando lo tengas
    // 'https://tu-app.onrender.com'
];

// En producción, permitir el dominio de Render
if (process.env.NODE_ENV === 'production' && process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
    origin: function (origin, callback) {
        // Permitir requests sin origin (como mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('No permitido por CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(morgan("dev"));
app.use(express.json());

app.use("/api/turnos", TurnosRouter);

// Ruta de health check para Render
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        message: 'Servidor funcionando correctamente',
        timestamp: new Date().toISOString()
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    try {
        connectDB();
        console.log(`Servidor corriendo en el puerto ${PORT}`);
    } catch (error) {
        console.error("Error al iniciar el servidor:", error);
    }
});
    