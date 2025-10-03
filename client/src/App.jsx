import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import PantallaTurnos from './components/PantallaTurnos'
import PantallaOperador from './components/PantallaOperador'
import SuperAdmin from './components/SuperAdmin'
import Login from './components/Login'
import './App.css'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<PantallaTurnos />} />
          <Route path="/operador" element={<PantallaOperador />} />
          <Route path="/super-admin" element={<SuperAdmin />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
