import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { 
    obtenerVideos, 
    subirVideo, 
    eliminarVideo, 
    actualizarVideo,
    servirVideo 
} from "../controllers/videos.controller.js";
import { authenticateToken, requireSuperAdmin } from "../middleware/auth.js";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Crear directorio de uploads si no existe
const uploadsDir = path.join(__dirname, '../../uploads/videos');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuración de multer para subida de videos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `video-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 500 * 1024 * 1024 // 500MB máximo
    },
    fileFilter: (req, file, cb) => {
        const tiposPermitidos = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm'];
        if (tiposPermitidos.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Tipo de archivo no permitido'), false);
        }
    }
});

// Rutas públicas (para la pantalla de turnos)
router.get("/", obtenerVideos);
router.get("/stream/:filename", servirVideo);

// Rutas protegidas para super admin
router.post("/", authenticateToken, requireSuperAdmin, upload.single('video'), subirVideo);
router.put("/:id", authenticateToken, requireSuperAdmin, actualizarVideo);
router.delete("/:id", authenticateToken, requireSuperAdmin, eliminarVideo);

export default router;