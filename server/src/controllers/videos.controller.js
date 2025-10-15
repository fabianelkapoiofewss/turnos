import { Videos } from "../models/videos.js";
import { Op } from "sequelize";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import cloudinary from '../config/cloudinary.js';

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
            // Eliminar archivo temporal si no es válido
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: 'Tipo de archivo no permitido. Solo se permiten videos.' });
        }

        // Subir a Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            resource_type: 'video',
            folder: 'turnos-videos',
            public_id: `video_${Date.now()}`,
        });

        // Eliminar archivo temporal local
        fs.unlinkSync(req.file.path);

        // Guardar información en la base de datos
        const video = await Videos.create({
            nombre,
            archivo: result.secure_url, // URL de Cloudinary
            cloudinary_public_id: result.public_id, // ID para eliminar después
            tipo_mime: req.file.mimetype,
            tamaño: result.bytes,
            orden: parseInt(orden)
        });

        res.status(201).json(video);
    } catch (error) {
        console.error('Error al subir video:', error);
        // Eliminar archivo temporal en caso de error
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

        // Eliminar de Cloudinary si tiene public_id
        if (video.cloudinary_public_id) {
            try {
                await cloudinary.uploader.destroy(video.cloudinary_public_id, {
                    resource_type: 'video'
                });
            } catch (cloudinaryError) {
                console.error('Error al eliminar de Cloudinary:', cloudinaryError);
                // Continuar con la eliminación de la BD aunque falle Cloudinary
            }
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
        
        // Buscar el video por su nombre de archivo (ahora es la URL de Cloudinary)
        const video = await Videos.findOne({
            where: {
                archivo: {
                    [Op.like]: `%${filename}%`
                }
            }
        });

        if (!video) {
            return res.status(404).json({ error: 'Video no encontrado' });
        }

        // Redirigir a la URL de Cloudinary
        res.redirect(video.archivo);
    } catch (error) {
        console.error('Error al servir video:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};