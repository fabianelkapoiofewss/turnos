import jwt from "jsonwebtoken";
import { Usuarios } from "../models/usuarios.js";

const JWT_SECRET = process.env.JWT_SECRET || "tu_clave_secreta_super_segura_2024";

export const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Token de acceso requerido' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const usuario = await Usuarios.findByPk(decoded.id);

        if (!usuario || !usuario.activo) {
            return res.status(401).json({ error: 'Usuario no válido' });
        }

        req.usuario = usuario;
        next();
    } catch (error) {
        console.error('Error de autenticación:', error);
        res.status(403).json({ error: 'Token inválido' });
    }
};

export const requireSuperAdmin = (req, res, next) => {
    if (req.usuario.role !== 'super_admin') {
        return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de super administrador' });
    }
    next();
};