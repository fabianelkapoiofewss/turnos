import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import PantallaTurnos from './components/PantallaTurnos'
import PantallaOperador from './components/PantallaOperador'
import './App.css'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<PantallaTurnos />} />
          <Route path="/operador" element={<PantallaOperador />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
