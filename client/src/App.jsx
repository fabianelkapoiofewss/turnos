import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import PantallaTurnos from './components/PantallaTurnos'
import PantallaOperador from './components/PantallaOperador'
import './App.css'

function AppContent() {
  const location = useLocation()
  
  // Debug: mostrar la ruta actual
  console.log('Ruta actual:', location.pathname)
  
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<PantallaTurnos />} />
        <Route path="/operador" element={<PantallaOperador />} />
        {/* Ruta catch-all para debugging */}
        <Route path="*" element={
          <div style={{padding: '20px', textAlign: 'center'}}>
            <h2>Ruta no encontrada: {location.pathname}</h2>
            <p><a href="/">Ir a Turnos</a> | <a href="/operador">Ir a Operador</a></p>
          </div>
        } />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
