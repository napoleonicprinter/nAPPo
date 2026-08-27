import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Device mode: pc/tablet/mobile based on Vite mode (import.meta.env.MODE)
// https://vite.dev/config/
export default defineConfig(({ command, mode }) => ({
  // Si es para GitHub Pages usa /nAPPo/, si es para desarrollo local o móvil usa rastro relativo/absoluto
  base: process.env.GITHUB_PAGES ? '/nAPPo/' : (command === 'serve' ? '/' : './'),
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('src/data/sites.json')) {
            return 'sitesData';
          }
          if (id.includes('src/data/events.json')) {
            return 'eventsData';
          }
          if (id.includes('node_modules/leaflet') || id.includes('node_modules/react-leaflet')) {
            return 'leaflet';
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'lucide';
          }
        }
      }
    }
  }
}))
