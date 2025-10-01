import axios from 'axios'

const API_URL = 'http://localhost:3000/api/turnos'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

export const turnosAPI = {
  // Obtener todos los turnos
  obtenerTurnos: () => api.get('/'),
  
  // Crear un nuevo turno
  crearTurno: (datos) => api.post('/', datos),
  
  // Actualizar estado de un turno
  actualizarTurno: (id, estado) => api.put(`/${id}`, { estado }),
  
  // Eliminar un turno
  eliminarTurno: (id) => api.delete(`/${id}`),
  
  // Llamar al siguiente turno
  llamarSiguiente: () => api.post('/llamar-siguiente')
}