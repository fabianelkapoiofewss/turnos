import { useState, useEffect, useRef } from 'react'
import { turnosAPI } from '../services/api'

const PantallaTurnos = () => {
  const [turnos, setTurnos] = useState([])
  const [turnoLlamado, setTurnoLlamado] = useState(null)
  const [fechaHora, setFechaHora] = useState(new Date())
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null)
  const [voces, setVoces] = useState([])
  const [vozSeleccionada, setVozSeleccionada] = useState('')
  const [mostrarSelector, setMostrarSelector] = useState(false)
  const turnosAnteriorRef = useRef([])

  // Función para reproducir sonido personalizado de turno
  const reproducirPitidoTurno = (callback) => {
    try {
      // Crear elemento de audio para sonido personalizado
      const audio = new Audio('/sonidos/turno-pitido.mp3') // Puedes cambiar la ruta y formato
      
      // Configurar volumen
      audio.volume = 0.7 // 70% de volumen
      
      // Cuando termine el sonido, ejecutar callback
      audio.onended = () => {
        console.log('🔔 Sonido personalizado completado')
        if (callback) callback()
      }
      
      // Si hay error con el audio personalizado, usar fallback
      audio.onerror = () => {
        console.warn('⚠️ No se pudo cargar sonido personalizado, usando fallback')
        reproducirPitidoFallback(callback)
      }
      
      // Reproducir sonido personalizado
      audio.play().then(() => {
        console.log('🔔 Reproduciendo sonido personalizado de turno')
      }).catch((error) => {
        console.warn('⚠️ Error al reproducir sonido personalizado:', error)
        reproducirPitidoFallback(callback)
      })
      
    } catch (error) {
      console.warn('⚠️ Error al crear audio personalizado:', error)
      reproducirPitidoFallback(callback)
    }
  }

  // Función de fallback con sonido sintético (por si falla el personalizado)
  const reproducirPitidoFallback = (callback) => {
    try {
      // Crear contexto de audio
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      
      // Sonido simple de notificación
      const oscilador = audioContext.createOscillator()
      const ganancia = audioContext.createGain()
      
      // Configurar oscilador para un "ding" simple
      oscilador.type = 'sine'
      oscilador.frequency.setValueAtTime(800, audioContext.currentTime) // Frecuencia más alta
      
      // Configurar volumen con fade out rápido
      ganancia.gain.setValueAtTime(0.4, audioContext.currentTime)
      ganancia.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
      
      // Conectar cadena de audio
      oscilador.connect(ganancia)
      ganancia.connect(audioContext.destination)
      
      // Reproducir
      oscilador.start(audioContext.currentTime)
      oscilador.stop(audioContext.currentTime + 0.5)
      
      // Ejecutar callback después del sonido
      setTimeout(() => {
        console.log('🔔 Sonido fallback completado')
        if (callback) callback()
      }, 600)
      
    } catch (error) {
      console.warn('⚠️ Error en sonido fallback:', error)
      // Si todo falla, ejecutar callback inmediatamente
      if (callback) callback()
    }
  }

  // Cargar voces y configurar voz preferida con localStorage
  useEffect(() => {
    const cargarVoces = () => {
      const vocesDisponibles = speechSynthesis.getVoices()
      console.log('🔍 Cargando voces disponibles:', vocesDisponibles.length)
      
      if (vocesDisponibles.length > 0) {
        setVoces(vocesDisponibles)
        
        // Intentar cargar voz guardada en localStorage
        const vozGuardada = localStorage.getItem('turnos-voz-preferida')
        
        if (vozGuardada) {
          // Buscar la voz guardada
          const vozEncontrada = vocesDisponibles.find(voz => voz.name === vozGuardada)
          if (vozEncontrada) {
            setVozSeleccionada(vozGuardada)
            console.log('✅ VOZ RESTAURADA DESDE LOCALSTORAGE:', vozEncontrada.name, `(${vozEncontrada.lang})`)
            return
          }
        }
        
        // Si no hay voz guardada, buscar Google español de Estados Unidos
        const vozGoogle = vocesDisponibles.find(voz => 
          voz.name.toLowerCase().includes('google') && 
          voz.lang === 'es-US'
        )
        
        if (vozGoogle) {
          setVozSeleccionada(vozGoogle.name)
          localStorage.setItem('turnos-voz-preferida', vozGoogle.name)
          console.log('✅ VOZ PREFERIDA AUTO-CONFIGURADA:', vozGoogle.name, `(${vozGoogle.lang})`)
        } else {
          // Fallback a primera voz en español
          const vozEspanol = vocesDisponibles.find(voz => 
            voz.lang.includes('es') || voz.lang.includes('ES')
          )
          if (vozEspanol) {
            setVozSeleccionada(vozEspanol.name)
            localStorage.setItem('turnos-voz-preferida', vozEspanol.name)
            console.log('✅ VOZ ESPAÑOL CONFIGURADA:', vozEspanol.name, `(${vozEspanol.lang})`)
          }
        }
      }
    }

    // Cargar voces inmediatamente y cuando cambien
    cargarVoces()
    speechSynthesis.onvoiceschanged = cargarVoces
    
    // Reintentar varias veces por si las voces tardan en cargar
    setTimeout(cargarVoces, 500)
    setTimeout(cargarVoces, 1500)
    setTimeout(cargarVoces, 3000)
  }, [])

  // Actualizar fecha y hora cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      setFechaHora(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Cargar turnos cada 15 segundos
  useEffect(() => {
    const cargarTurnos = async () => {
      try {
        const response = await turnosAPI.obtenerTurnos()
        if (response.data && Array.isArray(response.data)) {
          const turnosActuales = response.data
          
          // Verificar si hay un turno recién llamado
          const turnoRecienLlamado = turnosActuales.find(turno => {
            const turnoAnterior = turnosAnteriorRef.current.find(t => t.id === turno.id)
            return turno.estado === 'llamado' && 
                   (!turnoAnterior || turnoAnterior.estado !== 'llamado')
          })
          
          if (turnoRecienLlamado) {
            mostrarTurnoLlamado(turnoRecienLlamado)
          }
          
          turnosAnteriorRef.current = turnosActuales
          setTurnos(turnosActuales)
          setUltimaActualizacion(new Date())
        }
      } catch (error) {
        console.error('Error al cargar turnos:', error)
      }
    }

    cargarTurnos()
    const interval = setInterval(cargarTurnos, 15000)
    return () => clearInterval(interval)
  }, [])

  const mostrarTurnoLlamado = (turno) => {
    setTurnoLlamado(turno)
    
    // Reproducir sonido de pitido ANTES del text-to-speech
    reproducirPitidoTurno(() => {
      // Text to Speech con voz GARANTIZADA (se ejecuta después del pitido)
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel()
        
        setTimeout(() => {
          const mensaje = `Para carnet. ${turno.nombre}. Por favor acérquese.`
          const utterance = new SpeechSynthesisUtterance(mensaje)
          
          // ESTRATEGIA ROBUSTA: Múltiples intentos para encontrar la voz
          const vocesActuales = speechSynthesis.getVoices()
          let vozElegida = null
          
          // 1. Intentar con la voz seleccionada
          if (vozSeleccionada && vozSeleccionada.trim() !== '') {
            vozElegida = vocesActuales.find(voz => voz.name === vozSeleccionada)
            if (vozElegida) {
              console.log(`🎙️ USANDO VOZ SELECCIONADA: ${vozElegida.name} (${vozElegida.lang})`)
            }
          }
          
          // 2. Si no funciona, buscar desde localStorage
          if (!vozElegida) {
            const vozGuardada = localStorage.getItem('turnos-voz-preferida')
            if (vozGuardada) {
              vozElegida = vocesActuales.find(voz => voz.name === vozGuardada)
              if (vozElegida) {
                console.log(`🎙️ USANDO VOZ DESDE LOCALSTORAGE: ${vozElegida.name} (${vozElegida.lang})`)
                setVozSeleccionada(vozGuardada) // Sincronizar estado
              }
            }
          }
          
          // 3. Si aún no funciona, buscar Google español US
          if (!vozElegida) {
            vozElegida = vocesActuales.find(voz => 
              voz.name === 'Google español de Estados Unidos' || 
              (voz.name.toLowerCase().includes('google') && voz.lang === 'es-US')
            )
            if (vozElegida) {
              console.log(`🎙️ USANDO VOZ POR DEFECTO: ${vozElegida.name} (${vozElegida.lang})`)
              setVozSeleccionada(vozElegida.name)
              localStorage.setItem('turnos-voz-preferida', vozElegida.name)
            }
          }
          
          // 4. Último recurso: cualquier voz en español
          if (!vozElegida) {
            vozElegida = vocesActuales.find(voz => voz.lang.includes('es'))
            if (vozElegida) {
              console.log(`🎙️ USANDO VOZ ESPAÑOL ALTERNATIVA: ${vozElegida.name} (${vozElegida.lang})`)
            }
          }
          
          // Aplicar la voz encontrada
          if (vozElegida) {
            utterance.voice = vozElegida
          } else {
            console.log(`⚠️ NO SE ENCONTRÓ NINGUNA VOZ VÁLIDA. Usando voz del sistema`)
            console.log(`🔍 Estado actual: vozSeleccionada="${vozSeleccionada}", voces disponibles: ${vocesActuales.length}`)
          }
          
          // Configuración optimizada - VELOCIDAD AUMENTADA
          utterance.rate = 1.3    // Aumentado de 0.9 a 1.2 (más rápido)
          utterance.pitch = 1.0   // Tono normal
          utterance.volume = 1.0  // Volumen máximo
          
          // Eventos para verificar
          utterance.onstart = () => {
            console.log('🔊 ANUNCIO INICIADO CON:', utterance.voice ? `${utterance.voice.name} (${utterance.voice.lang})` : 'Voz del sistema')
            console.log('📢 Mensaje:', mensaje)
          }
          
          utterance.onend = () => {
            console.log('✅ Anuncio completado exitosamente')
          }
          
          utterance.onerror = (event) => {
            console.error('❌ Error en text-to-speech:', event.error)
          }
          
          speechSynthesis.speak(utterance)
        }, 300)
      } else {
        console.warn('⚠️ Text-to-Speech no disponible')
      }
    })
    
    setTimeout(() => {
      setTurnoLlamado(null)
    }, 6000)
  }

  // Función para probar la voz seleccionada
  const probarAudio = () => {
    // Reproducir pitido ANTES del text-to-speech en la prueba también
    reproducirPitidoTurno(() => {
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel()
        
        const mensaje = 'Prueba de audio. Sistema de turnos funcionando correctamente. por favor acérquese.'
        const utterance = new SpeechSynthesisUtterance(mensaje)
        
        // Usar la misma lógica robusta que en mostrarTurnoLlamado
        const vocesActuales = speechSynthesis.getVoices()
        let vozElegida = null
        
        // 1. Intentar con la voz seleccionada
        if (vozSeleccionada && vozSeleccionada.trim() !== '') {
          vozElegida = vocesActuales.find(voz => voz.name === vozSeleccionada)
        }
        
        // 2. Si no funciona, buscar desde localStorage
        if (!vozElegida) {
          const vozGuardada = localStorage.getItem('turnos-voz-preferida')
          if (vozGuardada) {
            vozElegida = vocesActuales.find(voz => voz.name === vozGuardada)
            if (vozElegida) {
              setVozSeleccionada(vozGuardada) // Sincronizar estado
            }
          }
        }
        
        // 3. Buscar Google español US por defecto
        if (!vozElegida) {
          vozElegida = vocesActuales.find(voz => 
            voz.name === 'Google español de Estados Unidos' || 
            (voz.name.toLowerCase().includes('google') && voz.lang === 'es-US')
          )
        }
        
        if (vozElegida) {
          utterance.voice = vozElegida
          console.log(`🧪 PROBANDO VOZ: ${vozElegida.name} (${vozElegida.lang})`)
        } else {
          console.log(`⚠️ No se pudo encontrar voz para prueba`)
        }
        
        utterance.rate = 1.3    // Velocidad aumentada - igual que en el anuncio real
        utterance.pitch = 1.0   // Tono normal
        utterance.volume = 1.0  // Volumen máximo
        
        utterance.onstart = () => console.log('🔊 Prueba iniciada con:', utterance.voice ? utterance.voice.name : 'Voz del sistema')
        utterance.onend = () => console.log('✅ Prueba completada')
        utterance.onerror = (event) => console.error('❌ Error en prueba:', event.error)
        
        speechSynthesis.speak(utterance)
      }
    })
  }

  // Función para cambiar voz y guardarla permanentemente
  const cambiarVoz = (nombreVoz) => {
    console.log(`🔄 CAMBIANDO VOZ: "${nombreVoz}"`)
    setVozSeleccionada(nombreVoz)
    localStorage.setItem('turnos-voz-preferida', nombreVoz)
    
    const voz = voces.find(v => v.name === nombreVoz)
    if (voz) {
      console.log('💾 VOZ GUARDADA EN LOCALSTORAGE:', voz.name, `(${voz.lang})`)
    }
  }

  // Debug: Monitorear cambios en vozSeleccionada
  useEffect(() => {
    console.log(`🔍 ESTADO vozSeleccionada cambió a: "${vozSeleccionada}"`)
    console.log(`💾 localStorage actual:`, localStorage.getItem('turnos-voz-preferida'))
  }, [vozSeleccionada])

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

  // Filtrar turnos que no estén atendidos y mostrar máximo 8
  const turnosMostrar = turnos.filter(turno => turno.estado !== 'atendido').slice(0, 8)

  return (
    <div className="pantalla-turnos-nueva">
      {/* Título superior */}
      <header className="titulo-principal">
        <h1>TURNOS PARA REALIZAR EL CARNET</h1>
      </header>

      {/* Layout principal */}
      <div className="contenido-principal">
        {/* Panel izquierdo - Lista de turnos */}
        <div className="panel-turnos">
          <div className="lista-turnos-nueva">
            {turnosMostrar.length > 0 ? (
              turnosMostrar.map((turno) => (
                <div 
                  key={turno.id} 
                  className={`tarjeta-turno ${turno.estado}`}
                >
                  <div className="nombre-usuario">
                    {turno.nombre.toUpperCase()}
                  </div>
                  {turno.estado === 'llamado' && (
                    <div className="indicador-llamado">LLAMANDO</div>
                  )}
                </div>
              ))
            ) : (
              <div className="sin-turnos">
                <p>No hay turnos pendientes</p>
              </div>
            )}
          </div>
        </div>

        {/* Panel derecho - Contenido multimedia */}
        <div className="panel-multimedia">
          <div className="contenedor-video">
            {/* <div className="texto-video">
              VIDEO INSTITUCIONAL CARGADO DESDE UN SUPER ADMIN
            </div> */}
            <div className="area-video">
              {/* Aquí irá el video o contenido multimedia */}
              <div className="placeholder-video">
                <h3>📺 Área de Video</h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Información de sistema (minimizada) */}
      <div className="info-sistema">
        <div className="fecha-hora-mini">
          {formatearFecha(fechaHora)} - {formatearHora(fechaHora)}
        </div>
        <div className="controles-mini">
          <img 
            src="/src/assets/arielcaniza.png" 
            alt="Ariel Caniza" 
            className="imagen-institucional"
            style={{
              height: '90px',
              width: 'auto',
              objectFit: 'contain',
              marginRight: '15px',
              borderRadius: '5px'
            }}
          />
          <img 
            src="/src/assets/municipalidaddeclorinda.png" 
            alt="Municipalidad de Clorinda" 
            className="imagen-institucional"
            style={{
              height: '90px',
              width: 'auto',
              objectFit: 'contain',
              borderRadius: '5px'
            }}
          />
        </div>
        
        {/* Selector de voces (oculto por defecto) */}
        {mostrarSelector && voces.length > 0 && (
          <div className="selector-voces-mini">
            <select 
              value={vozSeleccionada} 
              onChange={(e) => cambiarVoz(e.target.value)}
              style={{
                padding: '5px',
                fontSize: '12px',
                background: 'rgba(0,0,0,0.7)',
                color: 'white',
                border: '1px solid #ccc',
                borderRadius: '3px'
              }}
            >
              {voces.map((voz, index) => (
                <option key={index} value={voz.name} style={{ background: '#333' }}>
                  {voz.name} ({voz.lang})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Modal de turno llamado (sin cambios) */}
      {turnoLlamado && (
        <div className="modal-llamado">
          <div className="modal-content">
            <h2>SIGUIENTE</h2>
            <p>{turnoLlamado.nombre}</p>
            <p>Por favor acérquese</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default PantallaTurnos