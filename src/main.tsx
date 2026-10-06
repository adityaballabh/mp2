import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Off so the URL-driven search box keeps up with typing */}
    <BrowserRouter basename={import.meta.env.BASE_URL} useTransitions={false}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
