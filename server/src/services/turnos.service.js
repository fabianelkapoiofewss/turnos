import { Turnos } from "../models/turnos.js";
import { Op } from "sequelize";

export const crearTurno = async (nombre, horaLlamado = null) => {
    try {
            // Crear el nuevo turno sin numero incremental (se usa createdAt)
            const nuevoTurno = await Turnos.create({
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
            order: [
                // Primero los que están esperando o llamados (más importantes)
                ['estado', 'ASC'],
                // Dentro de cada estado, por fecha de creación
                ['createdAt', 'ASC']
            ],
            // Aumentar límite para asegurar que se vean todos los pendientes
            limit: 50
        });

        if (!turnos || turnos.length === 0) {
            return [];
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
        // Determinar umbral de antigüedad (horas) para ignorar turnos viejos
        const maxWaitHours = parseInt(process.env.MAX_WAIT_HOURS, 10) || 12;
        const fechaCorte = new Date(Date.now() - maxWaitHours * 60 * 60 * 1000);

        // Buscar el próximo turno esperando que sea reciente (createdAt >= fechaCorte)
        const proximoTurno = await Turnos.findOne({
            where: {
                estado: 'esperando',
                createdAt: { [Op.gte]: fechaCorte }
            },
            order: [['createdAt', 'ASC']]
        });

        if (!proximoTurno) {
            // Verificar si existen turnos en espera pero más antiguos que el umbral
            const antiguosCount = await Turnos.count({
                where: {
                    estado: 'esperando',
                    createdAt: { [Op.lt]: fechaCorte }
                }
            });

            if (antiguosCount > 0) {
                return { message: `Hay ${antiguosCount} turnos en espera, pero son anteriores a ${maxWaitHours} horas y se han omitido` };
            }

            return { message: "No hay turnos en espera" };
        }

        proximoTurno.estado = 'llamado';
        // Guardar la hora completa en UTC; el cliente la mostrará en localtime
        proximoTurno.hora_llamado = new Date();
        await proximoTurno.save();

        return proximoTurno;
    } catch (error) {
        console.error("Error al llamar el siguiente turno:", error);
        throw error;
    }
};

// Nuevo: Llamar turno específico por ID
export const llamarTurnoEspecifico = async (id) => {
    try {
        const turno = await Turnos.findByPk(id);
        
        if (!turno) {
            return { message: "Turno no encontrado" };
        }
        
        if (turno.estado !== 'esperando') {
            return { message: `No se puede llamar un turno con estado: ${turno.estado}` };
        }
        
        turno.estado = 'llamado';
        turno.hora_llamado = new Date();
        await turno.save();
        
        return turno;
    } catch (error) {
        console.error("Error al llamar turno específico:", error);
        throw error;
    }
};

// Nuevo endpoint para verificar cambios
export const verificarCambios = async (ultimaActualizacion) => {
    try {
        const fechaLimite = new Date(ultimaActualizacion);
        
        const turnosModificados = await Turnos.findAll({
            where: {
                updatedAt: {
                    [Op.gt]: fechaLimite
                }
            },
            order: [['updatedAt', 'DESC']],
            limit: 5
        });

        return {
            haycambios: turnosModificados.length > 0,
            turnos: turnosModificados
        };
    } catch (error) {
        console.error("Error al verificar cambios:", error);
        throw error;
    }
};