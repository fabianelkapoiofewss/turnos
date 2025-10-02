import { useState, useEffect, useRef } from 'react'
import { turnosAPI } from '../services/api'

const PantallaTurnos = () => {
  const [turnos, setTurnos] = useState([])
  const [turnoLlamado, setTurnoLlamado] = useState(null)
  const [fechaHora, setFechaHora] = useState(new Date())
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null)
  const [voces, setVoces] = useState([])
  const [vozSeleccionada, setVozSeleccionada] = useState('')
  const turnosAnteriorRef = useRef([])

  // Cargar voces disponibles
  useEffect(() => {
    const cargarVoces = () => {
      const vocesDisponibles = speechSynthesis.getVoices()
      setVoces(vocesDisponibles)
      
      // Seleccionar una voz en español por defecto
      const vozEspanol = vocesDisponibles.find(voz => 
        voz.lang.includes('es') || voz.lang.includes('ES')
      )
      if (vozEspanol) {
        setVozSeleccionada(vozEspanol.name)
      }
    }

    // Cargar voces al inicio y cuando cambien
    cargarVoces()
    speechSynthesis.onvoiceschanged = cargarVoces
  }, [])

  // Actualizar fecha y hora cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      setFechaHora(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Cargar turnos cada 15 segundos (reducido de 5)
  useEffect(() => {
    const cargarTurnos = async () => {
      try {
        const response = await turnosAPI.obtenerTurnos()
        if (response.data && Array.isArray(response.data)) {
          const turnosActuales = response.data
          
          // Verificar si hay un turno recién llamado comparando con el estado anterior
          const turnoRecienLlamado = turnosActuales.find(turno => {
            const turnoAnterior = turnosAnteriorRef.current.find(t => t.id === turno.id)
            return turno.estado === 'llamado' && 
                   (!turnoAnterior || turnoAnterior.estado !== 'llamado')
          })
          
          if (turnoRecienLlamado) {
            mostrarTurnoLlamado(turnoRecienLlamado)
          }
          
          // Actualizar referencias y estado
          turnosAnteriorRef.current = turnosActuales
          setTurnos(turnosActuales)
          setUltimaActualizacion(new Date())
        }
      } catch (error) {
        console.error('Error al cargar turnos:', error)
      }
    }

    // Cargar inmediatamente al montar
    cargarTurnos()
    
    // Luego cada 15 segundos
    const interval = setInterval(cargarTurnos, 15000)
    return () => clearInterval(interval)
  }, []) // Eliminar dependencia de turnos para evitar bucle

  const mostrarTurnoLlamado = (turno) => {
    setTurnoLlamado(turno)
    
    // Text to Speech mejorado
    if ('speechSynthesis' in window) {
      // Cancelar cualquier síntesis anterior
      speechSynthesis.cancel()
      
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(
          `Turno número ${turno.numero_turno}. ${turno.nombre}. Por favor acérquese al mostrador.`
        )
        
        // Usar la voz seleccionada
        const vozElegida = voces.find(voz => voz.name === vozSeleccionada)
        if (vozElegida) {
          utterance.voice = vozElegida
        }
        
        // Configuración mejorada
        utterance.rate = 0.7
        utterance.pitch = 1.1
        utterance.volume = 0.9
        
        // Eventos para debug
        utterance.onstart = () => console.log('Iniciando anuncio de voz')
        utterance.onend = () => console.log('Anuncio de voz completado')
        utterance.onerror = (event) => console.error('Error en text-to-speech:', event)
        
        speechSynthesis.speak(utterance)
      }, 500) // Pequeña pausa antes de hablar
    } else {
      console.warn('Text-to-Speech no soportado en este navegador')
    }
    
    // Ocultar modal después de 6 segundos (aumentado)
    setTimeout(() => {
      setTurnoLlamado(null)
    }, 6000)
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

  // Función para probar audio
  const probarAudio = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance('Prueba de audio. Sistema de turnos funcionando correctamente.')
      
      // Usar la voz seleccionada
      const vozElegida = voces.find(voz => voz.name === vozSeleccionada)
      if (vozElegida) {
        utterance.voice = vozElegida
      }
      
      utterance.rate = 0.7
      utterance.pitch = 1.1
      speechSynthesis.speak(utterance)
    }
  }

  // Función para probar una voz específica
  const probarVoz = (nombreVoz) => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance('Turno número 1, Juan Pérez, por favor acérquese al mostrador.')
      
      const voz = voces.find(v => v.name === nombreVoz)
      if (voz) {
        utterance.voice = voz
      }
      
      utterance.rate = 0.7
      utterance.pitch = 1.1
      utterance.volume = 0.9
      speechSynthesis.speak(utterance)
    }
  }

  return (
    <div className="pantalla-turnos">
      <header className="header-turnos">
        <h1>Sistema de Turnos</h1>
        <div className="fecha-hora">
          <div>{formatearFecha(fechaHora)}</div>
          <div>{formatearHora(fechaHora)}</div>
        </div>
        <div className="info-conexion">
          <small>
            Última actualización: {ultimaActualizacion ? formatearHora(ultimaActualizacion) : 'Cargando...'}
            <button 
              onClick={probarAudio} 
              style={{ marginLeft: '10px', padding: '5px 10px', fontSize: '12px' }}
            >
              🔊 Probar Audio
            </button>
          </small>
          
          {/* Panel de prueba de voces */}
          <div className="panel-voces" style={{ 
            marginTop: '15px', 
            padding: '15px', 
            background: 'rgba(255,255,255,0.1)', 
            borderRadius: '10px',
            backdropFilter: 'blur(5px)'
          }}>
            <h3 style={{ marginBottom: '10px', fontSize: '1rem' }}>🎙️ Selector de Voces (Temporal)</h3>
            
            <div style={{ marginBottom: '10px' }}>
              <label style={{ marginRight: '10px' }}>Voz actual:</label>
              <select 
                value={vozSeleccionada} 
                onChange={(e) => setVozSeleccionada(e.target.value)}
                style={{
                  padding: '5px 10px',
                  borderRadius: '5px',
                  border: '1px solid rgba(255,255,255,0.3)',
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  minWidth: '200px'
                }}
              >
                {voces.map((voz, index) => (
                  <option key={index} value={voz.name} style={{ background: '#333', color: 'white' }}>
                    {voz.name} ({voz.lang}) {voz.default ? '⭐' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '10px', maxHeight: '200px', overflowY: 'auto' }}>
              {voces
                .filter(voz => voz.lang.includes('es') || voz.lang.includes('ES') || voz.lang.includes('en'))
                .map((voz, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px',
                  background: vozSeleccionada === voz.name ? 'rgba(255,215,0,0.3)' : 'rgba(255,255,255,0.1)',
                  borderRadius: '5px',
                  border: vozSeleccionada === voz.name ? '2px solid gold' : '1px solid rgba(255,255,255,0.2)'
                }}>
                  <span style={{ fontSize: '0.8rem', flex: 1 }}>
                    <strong>{voz.name}</strong><br/>
                    <small>🌍 {voz.lang} {voz.default ? '⭐ Default' : ''}</small>
                  </span>
                  <button
                    onClick={() => probarVoz(voz.name)}
                    style={{
                      padding: '4px 8px',
                      fontSize: '0.7rem',
                      background: 'rgba(0,123,255,0.7)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      marginLeft: '10px'
                    }}
                  >
                    ▶️ Probar
                  </button>
                </div>
              ))}
            </div>
            
            <div style={{ marginTop: '10px', fontSize: '0.8rem', opacity: '0.8' }}>
              💡 <strong>Tip:</strong> Las voces marcadas con 🌍 es-ES o es-MX son mejores para español.
              <br/>
              ⭐ = Voz por defecto del sistema
            </div>
          </div>
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