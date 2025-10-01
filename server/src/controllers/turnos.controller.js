import {
    actualizarEstadoTurno,
    crearTurno,
    eliminarTurno,
    obtenerTurnos,
    llamarSiguienteTurno,
} from '../services/turnos.service.js';


export const getTurnos = async (req, res) => {
    try {
        const turnos = await obtenerTurnos();
        res.status(200).json(turnos);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener los turnos" });
    }
};


export const postTurnos = async (req, res) => {
    try {
        const { nombre, hora_llamado } = req.body;
        if (!nombre) {
            return res.status(400).json({ message: "El nombre es obligatorio" });
        }
        const nuevoTurno = await crearTurno(nombre, hora_llamado);
        res.status(201).json(nuevoTurno);
    } catch (error) {
        res.status(500).json({ message: "Error al crear el turno" });
    }
};


export const putTurnos = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;
        if (!estado) {
            return res.status(400).json({ message: "Faltan datos obligatorios" });
        }
        const turnoActualizado = await actualizarEstadoTurno(id, estado);
        if (turnoActualizado.message) {
            return res.status(404).json(turnoActualizado);
        }
        res.status(200).json(turnoActualizado);
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar el estado del turno" });
    }
};


export const deleteTurnos = async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await eliminarTurno(id);
        if (resultado.message === "Turno no encontrado") {
            return res.status(404).json(resultado);
        }
        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar el turno" });
    }
};

export const llamarSiguiente = async (req, res) => {
    try {
        const resultado = await llamarSiguienteTurno();
        if (resultado.message) {
            return res.status(404).json(resultado);
        }
        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({ message: "Error al llamar el siguiente turno" });
    }
};