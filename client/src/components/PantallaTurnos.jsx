import { useState, useEffect } from 'react'
import { turnosAPI } from '../services/api'

const PantallaTurnos = () => {
  const [turnos, setTurnos] = useState([])
  const [turnoLlamado, setTurnoLlamado] = useState(null)
  const [fechaHora, setFechaHora] = useState(new Date())

  // Actualizar fecha y hora cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      setFechaHora(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Cargar turnos cada 5 segundos
  useEffect(() => {
    const cargarTurnos = async () => {
      try {
        const response = await turnosAPI.obtenerTurnos()
        if (response.data && Array.isArray(response.data)) {
          setTurnos(response.data)
          
          // Verificar si hay un turno recién llamado
          const recienLlamado = response.data.find(turno => 
            turno.estado === 'llamado' && 
            !turnos.find(t => t.id === turno.id && t.estado === 'llamado')
          )
          
          if (recienLlamado) {
            mostrarTurnoLlamado(recienLlamado)
          }
        }
      } catch (error) {
        console.error('Error al cargar turnos:', error)
      }
    }

    cargarTurnos()
    const interval = setInterval(cargarTurnos, 5000)
    return () => clearInterval(interval)
  }, [turnos])

  const mostrarTurnoLlamado = (turno) => {
    setTurnoLlamado(turno)
    
    // Text to Speech
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(
        `Turno número ${turno.numero_turno}, ${turno.nombre}, por favor acérquese al mostrador`
      )
      utterance.lang = 'es-ES'
      utterance.rate = 0.8
      utterance.pitch = 1
      speechSynthesis.speak(utterance)
    }
    
    // Ocultar modal después de 5 segundos
    setTimeout(() => {
      setTurnoLlamado(null)
    }, 5000)
  }

  const formatearFecha = (fecha) => {
    return fecha.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatearHora = (fecha) => {
    return fecha.toLocaleTimeString('es-ES')
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

  // Mostrar solo los primeros 8 turnos
  const turnosMostrar = turnos.slice(0, 8)

  return (
    <div className="pantalla-turnos">
      <header className="header-turnos">
        <h1>Sistema de Turnos</h1>
        <div className="fecha-hora">
          <div>{formatearFecha(fechaHora)}</div>
          <div>{formatearHora(fechaHora)}</div>
        </div>
      </header>

      <div className="lista-turnos">
        {turnosMostrar.length > 0 ? (
          turnosMostrar.map((turno) => (
            <div 
              key={turno.id} 
              className={`turno-card ${turno.estado}`}
            >
              <div className="numero-turno">
                #{turno.numero_turno}
              </div>
              <div className="nombre-turno">
                {turno.nombre}
              </div>
              <div className="estado-turno">
                {obtenerEstadoTexto(turno.estado)}
              </div>
              {turno.hora_llamado && (
                <div className="hora-llamado">
                  Llamado: {turno.hora_llamado}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="no-turnos">
            <h2>No hay turnos disponibles</h2>
          </div>
        )}
      </div>

      {/* Modal de turno llamado */}
      {turnoLlamado && (
        <div className="modal-llamado">
          <div className="modal-content">
            <h2>TURNO #{turnoLlamado.numero_turno}</h2>
            <p>{turnoLlamado.nombre}</p>
            <p>Por favor acérquese al mostrador</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default PantallaTurnos