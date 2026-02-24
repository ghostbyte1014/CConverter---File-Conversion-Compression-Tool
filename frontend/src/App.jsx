import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Convert from './pages/Convert'
import Compress from './pages/Compress'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/convert" element={<Convert />} />
          <Route path="/compress" element={<Compress />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
