import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { initAdminAuth } from './admin/store/useAdminAuth'
import './styles/globals.css'

// Подписываемся на Supabase Auth-сессию один раз при загрузке.
// Сессия хранится в localStorage (storageKey: 'fp_admin_session').
initAdminAuth()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)
