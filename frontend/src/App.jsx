import React from 'react'
import Dashboard from './pages/dashboard'
import { Route, Routes } from 'react-router-dom'
import Workspace from './pages/Workspace'

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Dashboard />} />

        <Route path="/assignment/:id" element={<Workspace />} />
      </Routes>

      {/* <Dashboard /> */}
    </div>
  )
}

export default App
