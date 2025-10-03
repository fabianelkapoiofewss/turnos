import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'
import './Login.css'

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await authAPI.login(credentials)
      const { token, usuario } = response.data
      
      // Verificar que sea super admin
      if (usuario.role !== 'super_admin') {
        setError('Acceso denegado. Solo super administradores pueden acceder.')
        return
      }
      
      // Guardar token y datos del usuario
      localStorage.setItem('token', token)
      localStorage.setItem('usuario', JSON.stringify(usuario))
      
      // Redirigir al panel super admin
      navigate('/super-admin')
    } catch (error) {
      console.error('Error en login:', error)
      setError(error.response?.data?.error || 'Credenciales inválidas')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Administrador</h2>
        <p>Panel de Gestión de Videos Institucionales</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Usuario:</label>
            <input
              type="text"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              placeholder="admin"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Contraseña:</label>
            <input
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            disabled={loading}
            className="login-button"
          >
            {loading ? 'Verificando...' : 'Acceder'}
          </button>
        </form>

        <div className="login-info">
          <p><strong>solo Administradores</strong></p>
          <button 
            onClick={() => navigate('/operador')}
            className="btn-back"
          >
            ← Volver al Panel Operador
          </button>
        </div>
      </div>
    </div>
  )
}

export default Login