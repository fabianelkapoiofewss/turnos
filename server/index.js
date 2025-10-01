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
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan("dev"));
app.use(express.json());

app.use("/api/turnos", TurnosRouter);
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    try {
        connectDB();
        console.log(`Servidor corriendo en el puerto ${PORT}`);
    } catch (error) {
        console.error("Error al iniciar el servidor:", error);
    }
});
    