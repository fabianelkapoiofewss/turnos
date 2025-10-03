import { Videos } from "../models/videos.js";
import { Op } from "sequelize";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const obtenerVideos = async (req, res) => {
    try {
        const videos = await Videos.findAll({
            where: { activo: true },
            order: [['orden', 'ASC'], ['createdAt', 'ASC']]
        });
        res.json(videos);
    } catch (error) {
        console.error('Error al obtener videos:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const subirVideo = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se ha subido ningún archivo' });
        }

        const { nombre, orden = 0 } = req.body;
        
        if (!nombre) {
            return res.status(400).json({ error: 'El nombre es requerido' });
        }

        // Validar tipo de archivo
        const tiposPermitidos = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm'];
        if (!tiposPermitidos.includes(req.file.mimetype)) {
            // Eliminar archivo si no es válido
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: 'Tipo de archivo no permitido. Solo se permiten videos.' });
        }

        const video = await Videos.create({
            nombre,
            archivo: req.file.filename,
            tipo_mime: req.file.mimetype,
            tamaño: req.file.size,
            orden: parseInt(orden)
        });

        res.status(201).json(video);
    } catch (error) {
        console.error('Error al subir video:', error);
        // Eliminar archivo en caso de error
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const eliminarVideo = async (req, res) => {
    try {
        const { id } = req.params;
        
        const video = await Videos.findByPk(id);
        if (!video) {
            return res.status(404).json({ error: 'Video no encontrado' });
        }

        // Eliminar archivo físico
        const rutaArchivo = path.join(__dirname, '../../uploads/videos', video.archivo);
        if (fs.existsSync(rutaArchivo)) {
            fs.unlinkSync(rutaArchivo);
        }

        await video.destroy();
        res.json({ message: 'Video eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar video:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const actualizarVideo = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, orden, activo } = req.body;

        const video = await Videos.findByPk(id);
        if (!video) {
            return res.status(404).json({ error: 'Video no encontrado' });
        }

        await video.update({
            nombre: nombre || video.nombre,
            orden: orden !== undefined ? parseInt(orden) : video.orden,
            activo: activo !== undefined ? activo : video.activo
        });

        res.json(video);
    } catch (error) {
        console.error('Error al actualizar video:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const servirVideo = async (req, res) => {
    try {
        const { filename } = req.params;
        const rutaArchivo = path.join(__dirname, '../../uploads/videos', filename);

        if (!fs.existsSync(rutaArchivo)) {
            return res.status(404).json({ error: 'Video no encontrado' });
        }

        const stat = fs.statSync(rutaArchivo);
        const fileSize = stat.size;
        const range = req.headers.range;

        if (range) {
            // Soporte para streaming de video
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunksize = (end - start) + 1;
            const file = fs.createReadStream(rutaArchivo, { start, end });
            
            res.writeHead(206, {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': 'video/mp4',
            });
            
            file.pipe(res);
        } else {
            res.writeHead(200, {
                'Content-Length': fileSize,
                'Content-Type': 'video/mp4',
            });
            fs.createReadStream(rutaArchivo).pipe(res);
        }
    } catch (error) {
        console.error('Error al servir video:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};