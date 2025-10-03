import { Usuarios } from "../models/usuarios.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "tu_clave_secreta_super_segura_2024";

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log('🔍 Login attempt:', { username, password: '***' });

        if (!username || !password) {
            console.log('❌ Missing credentials');
            return res.status(400).json({ error: 'Username y password son requeridos' });
        }

        const usuario = await Usuarios.findOne({ 
            where: { username, activo: true } 
        });
        
        console.log('🔍 Usuario encontrado:', usuario ? 'SÍ' : 'NO');
        if (usuario) {
            console.log('🔍 Usuario details:', { id: usuario.id, username: usuario.username, role: usuario.role, activo: usuario.activo });
        }

        if (!usuario) {
            console.log('❌ Usuario no encontrado');
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const passwordValida = await usuario.verificarPassword(password);
        console.log('🔍 Password válida:', passwordValida ? 'SÍ' : 'NO');

        if (!passwordValida) {
            console.log('❌ Password inválida');
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const token = jwt.sign(
            { 
                id: usuario.id, 
                username: usuario.username, 
                role: usuario.role 
            },
            JWT_SECRET,
        );

        console.log('✅ Login exitoso para:', usuario.username);
        res.json({
            token,
            usuario: {
                id: usuario.id,
                username: usuario.username,
                role: usuario.role
            }
        });
    } catch (error) {
        console.error('❌ Error en login:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const verificarToken = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ error: 'Token no proporcionado' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const usuario = await Usuarios.findByPk(decoded.id);

        if (!usuario || !usuario.activo) {
            return res.status(401).json({ error: 'Usuario no válido' });
        }

        res.json({
            usuario: {
                id: usuario.id,
                username: usuario.username,
                role: usuario.role
            }
        });
    } catch (error) {
        console.error('Error al verificar token:', error);
        res.status(401).json({ error: 'Token inválido' });
    }
};

export const crearUsuario = async (req, res) => {
    try {
        const { username, password, role = 'operador' } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username y password son requeridos' });
        }

        const usuarioExistente = await Usuarios.findOne({ where: { username } });
        if (usuarioExistente) {
            return res.status(400).json({ error: 'El username ya existe' });
        }

        const usuario = await Usuarios.create({
            username,
            password,
            role
        });

        res.status(201).json({
            usuario: {
                id: usuario.id,
                username: usuario.username,
                role: usuario.role
            }
        });
    } catch (error) {
        console.error('Error al crear usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};