import axios from 'axios'

// Configuración de URL de API para desarrollo y producción
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para agregar token a las requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
      // Solo redirigir si no estamos ya en login
      if (!window.location.hash.includes('/login')) {
        window.location.hash = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export const turnosAPI = {
  // Obtener todos los turnos
  obtenerTurnos: () => api.get('/turnos'),
  
  // Crear un nuevo turno
  crearTurno: (datos) => api.post('/turnos', datos),
  
  // Actualizar estado de un turno
  actualizarTurno: (id, estado) => api.put(`/turnos/${id}`, { estado }),
  
  // Eliminar un turno
  eliminarTurno: (id) => api.delete(`/turnos/${id}`),
  
  // Llamar al siguiente turno
  llamarSiguiente: () => api.post('/turnos/llamar-siguiente')
}

export const videosAPI = {
  // Obtener todos los videos
  obtenerVideos: () => api.get('/videos'),
  
  // Subir un nuevo video
  subirVideo: (formData) => api.post('/videos', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  
  // Actualizar video
  actualizarVideo: (id, datos) => api.put(`/videos/${id}`, datos),
  
  // Eliminar video
  eliminarVideo: (id) => api.delete(`/videos/${id}`),
  
  // Obtener URL de streaming
  obtenerUrlVideo: (filename) => `${BASE_URL}/videos/stream/${filename}`
}

export const authAPI = {
  // Login
  login: (credenciales) => api.post('/auth/login', credenciales),
  
  // Verificar token
  verify: () => api.get('/auth/verify'),
  
  // Crear usuario (solo super admin)
  crearUsuario: (datos) => api.post('/auth/usuarios', datos)
}