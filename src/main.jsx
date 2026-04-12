import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

console.log("%c >>> CARGANDO VERSIÓN NUEVA CON MAPAS DINÁMICOS <<< ", "background: #c9a227; color: #000; font-size: 20px; font-weight: bold;");

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

                    // Desactivado temporalmente para evitar caché del Service Worker
/*
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => console.log('[PWA] Service worker registered:', reg.scope))
      .catch((err) => console.warn('[PWA] Service worker registration failed:', err));
  });
}
*/
