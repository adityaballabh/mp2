import { Route, Routes } from 'react-router-dom'
import ListView from './pages/ListView'

function App() {
  return (
    <Routes>
      <Route path="/" element={<ListView />} />
    </Routes>
  )
}

export default App
