import { useState, useEffect } from 'react'
import { turnosAPI } from '../services/api'

const PantallaOperador = () => {
  const [turnos, setTurnos] = useState([])
  const [nombreNuevo, setNombreNuevo] = useState('')
  const [loading, setLoading] = useState(false)
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    cargarTurnos()
    // Actualizar cada 20 segundos (reducido de 10)
    const interval = setInterval(cargarTurnos, 20000)
    return () => clearInterval(interval)
  }, [])

  const cargarTurnos = async () => {
    try {
      const response = await turnosAPI.obtenerTurnos()
      if (response.data && Array.isArray(response.data)) {
        setTurnos(response.data)
      }
    } catch (error) {
      console.error('Error al cargar turnos:', error)
      mostrarMensaje('Error al cargar turnos', 'error')
    }
  }

  const crearTurno = async (e) => {
    e.preventDefault()
    if (!nombreNuevo.trim()) {
      mostrarMensaje('El nombre es obligatorio', 'error')
      return
    }

    setLoading(true)
    try {
      await turnosAPI.crearTurno({ nombre: nombreNuevo.trim() })
      setNombreNuevo('')
      cargarTurnos()
      mostrarMensaje('Turno creado exitosamente', 'success')
    } catch (error) {
      console.error('Error al crear turno:', error)
      mostrarMensaje('Error al crear turno', 'error')
    }
    setLoading(false)
  }

  const llamarSiguiente = async () => {
    setLoading(true)
    try {
      const response = await turnosAPI.llamarSiguiente()
      if (response.data.message) {
        mostrarMensaje(response.data.message, 'warning')
      } else {
        cargarTurnos()
        mostrarMensaje('Turno llamado exitosamente', 'success')
      }
    } catch (error) {
      console.error('Error al llamar turno:', error)
      mostrarMensaje('Error al llamar turno', 'error')
    }
    setLoading(false)
  }

  const actualizarEstado = async (id, nuevoEstado) => {
    try {
      await turnosAPI.actualizarTurno(id, nuevoEstado)
      cargarTurnos()
      mostrarMensaje('Estado actualizado', 'success')
    } catch (error) {
      console.error('Error al actualizar estado:', error)
      mostrarMensaje('Error al actualizar estado', 'error')
    }
  }

  const eliminarTurno = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este turno?')) {
      try {
        await turnosAPI.eliminarTurno(id)
        cargarTurnos()
        mostrarMensaje('Turno eliminado', 'success')
      } catch (error) {
        console.error('Error al eliminar turno:', error)
        mostrarMensaje('Error al eliminar turno', 'error')
      }
    }
  }

  const mostrarMensaje = (texto, tipo) => {
    setMensaje({ texto, tipo })
    setTimeout(() => setMensaje(''), 3000)
  }

  const obtenerEstadoTexto = (estado) => {
    const estados = {
      esperando: 'En espera',
      llamado: 'Llamando',
      atendido: 'Atendido',
      ausente: 'Ausente'
    }
    return estados[estado] || estado
  }

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-ES')
  }

  const turnosEspera = turnos.filter(t => t.estado === 'esperando')
  const turnosLlamados = turnos.filter(t => t.estado === 'llamado')
  const turnosAtendidos = turnos.filter(t => t.estado === 'atendido')

  return (
    <div className="pantalla-operador">
      <header className="header-operador">
        <h1>Panel de Operador - Sistema de Turnos</h1>
        <div className="controles">
          <button 
            className="btn btn-success"
            onClick={llamarSiguiente}
            disabled={loading || turnosEspera.length === 0}
          >
            {loading ? 'Llamando...' : 'Llamar Siguiente'}
          </button>
          <a 
            href="/" 
            className="btn btn-primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            Ver Pantalla TV
          </a>
        </div>
      </header>

      {mensaje && (
        <div className={`mensaje ${mensaje.tipo}`}>
          {mensaje.texto}
        </div>
      )}

      <div className="contenido-operador">

        <div className="seccion">
          <h2>Lista de Turnos</h2>
          <div className="tabla-container">
            <table className="tabla-turnos">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Estado</th>
                  <th>Hora Creación</th>
                  <th>Hora Llamado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {turnos.map((turno) => (
                  <tr key={turno.id} className={`turno-row ${turno.estado}`}>
                    <td>{turno.nombre}</td>
                    <td>
                      <span className={`badge ${turno.estado}`}>
                        {obtenerEstadoTexto(turno.estado)}
                      </span>
                    </td>
                    <td>{formatearFecha(turno.createdAt)}</td>
                    <td>{turno.hora_llamado || '-'}</td>
                    <td>
                      <div className="acciones">
                        {turno.estado === 'llamado' && (
                          <>
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => actualizarEstado(turno.id, 'atendido')}
                            >
                              Atendido
                            </button>
                            <button
                              className="btn btn-sm btn-warning"
                              onClick={() => actualizarEstado(turno.id, 'ausente')}
                            >
                              Ausente
                            </button>
                          </>
                        )}
                        {turno.estado === 'ausente' && (
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => actualizarEstado(turno.id, 'esperando')}
                          >
                            Re-llamar
                          </button>
                        )}
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => eliminarTurno(turno.id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {turnos.length === 0 && (
              <div className="no-turnos">
                <p>No hay turnos disponibles</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PantallaOperador