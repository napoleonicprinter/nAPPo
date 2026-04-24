import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Si estamos en GitHub Actions, la base es el nombre del repo. Si no, usamos relativa para Android/Local.
  base: process.env.GITHUB_PAGES ? '/nAPPo/' : './',
  plugins: [react()],
})
