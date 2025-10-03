import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { videosAPI, authAPI } from '../services/api'
import './SuperAdmin.css'

const SuperAdmin = () => {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(false)
  const [usuario, setUsuario] = useState(null)
  const [mensaje, setMensaje] = useState('')
  const [archivoVideo, setArchivoVideo] = useState(null)
  const [datosVideo, setDatosVideo] = useState({
    nombre: '',
    orden: 0
  })
  const navigate = useNavigate()

  useEffect(() => {
    verificarAutenticacion()
    cargarVideos()
  }, [])

  const verificarAutenticacion = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        navigate('/login')
        return
      }

      const response = await authAPI.verify()
      const userData = response.data.usuario
      
      if (userData.role !== 'super_admin') {
        navigate('/operador')
        return
      }
      
      setUsuario(userData)
    } catch (error) {
      console.error('Error de autenticación:', error)
      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
      navigate('/login')
    }
  }

  const cargarVideos = async () => {
    try {
      const response = await videosAPI.obtenerVideos()
      setVideos(response.data)
    } catch (error) {
      console.error('Error al cargar videos:', error)
      mostrarMensaje('Error al cargar videos', 'error')
    }
  }

  const mostrarMensaje = (texto, tipo = 'info') => {
    setMensaje({ texto, tipo })
    setTimeout(() => setMensaje(''), 4000)
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validar tamaño (500MB)
      if (file.size > 500 * 1024 * 1024) {
        mostrarMensaje('El archivo es demasiado grande. Máximo 500MB', 'error')
        return
      }
      
      // Validar tipo
      const tiposPermitidos = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm']
      if (!tiposPermitidos.includes(file.type)) {
        mostrarMensaje('Tipo de archivo no permitido. Solo videos', 'error')
        return
      }
      
      setArchivoVideo(file)
      // Auto-generar nombre si está vacío
      if (!datosVideo.nombre) {
        setDatosVideo({
          ...datosVideo,
          nombre: file.name.replace(/\.[^/.]+$/, "")
        })
      }
    }
  }

  const subirVideo = async (e) => {
    e.preventDefault()
    
    if (!archivoVideo) {
      mostrarMensaje('Selecciona un archivo de video', 'error')
      return
    }
    
    if (!datosVideo.nombre.trim()) {
      mostrarMensaje('El nombre es requerido', 'error')
      return
    }

    setLoading(true)
    
    try {
      const formData = new FormData()
      formData.append('video', archivoVideo)
      formData.append('nombre', datosVideo.nombre.trim())
      formData.append('orden', datosVideo.orden)

      await videosAPI.subirVideo(formData)
      
      // Resetear formulario
      setArchivoVideo(null)
      setDatosVideo({ nombre: '', orden: 0 })
      document.getElementById('video-input').value = ''
      
      cargarVideos()
      mostrarMensaje('Video subido exitosamente', 'success')
    } catch (error) {
      console.error('Error al subir video:', error)
      mostrarMensaje(error.response?.data?.error || 'Error al subir video', 'error')
    } finally {
      setLoading(false)
    }
  }

  const eliminarVideo = async (id, nombre) => {
    if (!confirm(`¿Estás seguro de eliminar el video "${nombre}"?`)) {
      return
    }

    try {
      await videosAPI.eliminarVideo(id)
      cargarVideos()
      mostrarMensaje('Video eliminado exitosamente', 'success')
    } catch (error) {
      console.error('Error al eliminar video:', error)
      mostrarMensaje('Error al eliminar video', 'error')
    }
  }

  const actualizarVideo = async (id, datos) => {
    try {
      await videosAPI.actualizarVideo(id, datos)
      cargarVideos()
      mostrarMensaje('Video actualizado exitosamente', 'success')
    } catch (error) {
      console.error('Error al actualizar video:', error)
      mostrarMensaje('Error al actualizar video', 'error')
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    navigate('/login')
  }

  const formatearTamaño = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="super-admin-container">
      <header className="admin-header">
        <h1>🎬 Panel Super Administrador</h1>
        <div className="admin-user-info">
          <span>👤 {usuario?.username}</span>
          <button onClick={() => navigate('/operador')} className="btn-secondary">
            📋 Panel Operador
          </button>
          <button onClick={() => navigate('/')} className="btn-secondary">
            📺 Ver Pantalla
          </button>
          <button onClick={logout} className="btn-danger">
            Cerrar Sesión
          </button>
        </div>
      </header>

      {mensaje && (
        <div className={`mensaje ${mensaje.tipo}`}>
          {mensaje.texto}
        </div>
      )}

      <div className="admin-content">
        {/* Sección de subida de videos */}
        <section className="upload-section">
          <h2>📤 Subir Nuevo Video</h2>
          <form onSubmit={subirVideo} className="upload-form">
            <div className="form-group">
              <label>Archivo de Video:</label>
              <input
                id="video-input"
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                disabled={loading}
              />
              <small>Formatos: MP4, AVI, MOV, WMV, WEBM (máx. 500MB)</small>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Nombre del Video:</label>
                <input
                  type="text"
                  value={datosVideo.nombre}
                  onChange={(e) => setDatosVideo({...datosVideo, nombre: e.target.value})}
                  placeholder="Ej: Video Institucional 2024"
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label>Orden de Reproducción:</label>
                <input
                  type="number"
                  value={datosVideo.orden}
                  onChange={(e) => setDatosVideo({...datosVideo, orden: parseInt(e.target.value)})}
                  min="0"
                  disabled={loading}
                />
                <small>0 = primero, números mayores = después</small>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading || !archivoVideo}
              className="btn-primary upload-btn"
            >
              {loading ? '⏳ Subiendo...' : '📤 Subir Video'}
            </button>
          </form>
        </section>

        {/* Lista de videos */}
        <section className="videos-section">
          <h2>🎥 Videos Disponibles ({videos.length})</h2>
          
          {videos.length === 0 ? (
            <div className="no-videos">
              <p>📭 No hay videos cargados</p>
              <p>Sube el primer video institucional</p>
            </div>
          ) : (
            <div className="videos-grid">
              {videos.map((video, index) => (
                <div key={video.id} className="video-card">
                  <div className="video-header">
                    <h3>{video.nombre}</h3>
                    <span className="video-order">#{video.orden}</span>
                  </div>
                  
                  <div className="video-info">
                    <p><strong>Archivo:</strong> {video.archivo}</p>
                    <p><strong>Tamaño:</strong> {formatearTamaño(video.tamaño)}</p>
                    <p><strong>Tipo:</strong> {video.tipo_mime}</p>
                    <p><strong>Subido:</strong> {new Date(video.createdAt).toLocaleDateString()}</p>
                    <p><strong>Estado:</strong> 
                      <span className={`status ${video.activo ? 'active' : 'inactive'}`}>
                        {video.activo ? '✅ Activo' : '❌ Inactivo'}
                      </span>
                    </p>
                  </div>

                  <div className="video-actions">
                    <button
                      onClick={() => actualizarVideo(video.id, { activo: !video.activo })}
                      className={`btn-toggle ${video.activo ? 'active' : 'inactive'}`}
                    >
                      {video.activo ? '❌ Desactivar' : '✅ Activar'}
                    </button>
                    
                    <button
                      onClick={() => eliminarVideo(video.id, video.nombre)}
                      className="btn-danger"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {videos.length > 0 && (
          <section className="info-section">
            <h3>ℹ️ Información del Sistema</h3>
            <div className="info-grid">
              <div className="info-item">
                <strong>🔄 Reproducción:</strong>
                <p>Los videos se reproducen en bucle según el orden establecido</p>
              </div>
              <div className="info-item">
                <strong>📺 Pantalla:</strong>
                <p>Solo se muestran videos activos en la pantalla principal</p>
              </div>
              <div className="info-item">
                <strong>🎯 Orden:</strong>
                <p>Números menores se reproducen primero</p>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

export default SuperAdmin