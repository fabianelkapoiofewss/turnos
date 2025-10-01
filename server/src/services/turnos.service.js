import { Turnos } from "../models/turnos.js";
import { Op } from "sequelize";

export const crearTurno = async (nombre, horaLlamado = null) => {
    try {
        // Obtener el próximo número de turno
        const ultimoTurno = await Turnos.findOne({
            order: [['numero_turno', 'DESC']]
        });
        
        const numeroTurno = ultimoTurno ? ultimoTurno.numero_turno + 1 : 1;
        
        const nuevoTurno = await Turnos.create({
            numero_turno: numeroTurno,
            nombre,
            hora_llamado: horaLlamado,
            estado: 'esperando'
        });
        return nuevoTurno;
    } catch (error) {
        console.error("Error al crear el turno:", error);
        throw error;
    }
};

export const obtenerTurnos = async () => {
    try {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const mañana = new Date(hoy);
        mañana.setDate(mañana.getDate() + 1);

        const turnos = await Turnos.findAll({
            where: {
                createdAt: {
                    [Op.gte]: hoy,
                    [Op.lt]: mañana
                }
            },
            order: [['numero_turno', 'ASC']]
        });

        if (!turnos || turnos.length === 0) {
            return { message: "No hay turnos para hoy" };
        }

        return turnos;
    } catch (error) {
        console.error("Error al obtener los turnos:", error);
        throw error;
    }
};


export const actualizarEstadoTurno = async (id, nuevoEstado) => {
    try {
        const turno = await Turnos.findByPk(id);
        if (!turno) {
            return { message: "Turno no encontrado" };
        } else if (turno.estado == 'atendido') {
            return { message: "El turno ya fue atendido" };
        }
        turno.estado = nuevoEstado;
        await turno.save();
        return turno;
    } catch (error) {
        console.error("Error al actualizar el estado del turno:", error);
        throw error;
    }
};


export const eliminarTurno = async (id) => {
    try {
        const turno = await Turnos.findByPk(id);
        if (!turno) {
            return { message: "Turno no encontrado" };
        }
        await turno.destroy();
        return { message: "Turno eliminado correctamente" };
    } catch (error) {
        console.error("Error al eliminar el turno:", error);
        throw error;
    }
};

export const llamarSiguienteTurno = async () => {
    try {
        const proximoTurno = await Turnos.findOne({
            where: { estado: 'esperando' },
            order: [['numero_turno', 'ASC']]
        });
        
        if (!proximoTurno) {
            return { message: "No hay turnos en espera" };
        }
        
        proximoTurno.estado = 'llamado';
        proximoTurno.hora_llamado = new Date().toTimeString().slice(0, 8);
        await proximoTurno.save();
        
        return proximoTurno;
    } catch (error) {
        console.error("Error al llamar el siguiente turno:", error);
        throw error;
    }
};