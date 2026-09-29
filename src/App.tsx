import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import DetailView from './pages/DetailView'
import GalleryView from './pages/GalleryView'
import ListView from './pages/ListView'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<ListView />} />
        <Route path="/gallery" element={<GalleryView />} />
        <Route path="/movie/:id" element={<DetailView />} />
      </Route>
    </Routes>
  )
}

export default App
