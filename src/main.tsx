import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* No transitions: the list's search box is driven by the URL, and a
        deferred render would let the input lag behind what was typed. */}
    <BrowserRouter basename={import.meta.env.BASE_URL} useTransitions={false}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
