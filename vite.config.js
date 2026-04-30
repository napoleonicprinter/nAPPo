import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // Si es para GitHub Pages usa /nAPPo/, si es para desarrollo local o móvil usa rastro relativo/absoluto
  base: process.env.GITHUB_PAGES ? '/nAPPo/' : (command === 'serve' ? '/' : './'),
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
  }
}))
