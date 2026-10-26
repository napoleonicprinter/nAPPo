import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Capacitor } from '@capacitor/core';

// Log para depuración
if (Capacitor.isNativePlatform()) {
  console.log("%c >>> MODO NATIVO (ANDROID) <<< ", "background: #2ea043; color: #fff; font-size: 14px;");
} else {
  console.log("%c >>> MODO PWA / WEB <<< ", "background: #58a6ff; color: #fff; font-size: 14px;");
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
// Set device mode attribute on body for responsive handling
if (import.meta.env && import.meta.env.MODE) {
  document.body.setAttribute('data-device-mode', import.meta.env.MODE);
}

// Service Worker registration (disabled until a custom sw.js is created to avoid 404 logs)
// if ('serviceWorker' in navigator && import.meta.env.PROD && !Capacitor.isNativePlatform()) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker
//       .register('./sw.js')
//       .then((reg) => console.log('[PWA] Service worker registrado con éxito:', reg.scope))
//       .catch((err) => console.warn('[PWA] Error al registrar el service worker:', err));
//   });
// }

