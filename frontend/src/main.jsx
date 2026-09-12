import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Enforce clean light mode
document.documentElement.classList.remove('dark');
try { localStorage.removeItem('sma_awh_theme'); } catch (_) {}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
