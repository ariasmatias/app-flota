import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// En desarrollo, las llamadas a /api se reenvían al backend local.
// En TEST y PROD lo resuelve Nginx (mismo origen), así que no hace falta configurar nada.
// Piloto corporativo aislado: Vite solo en loopback, accedido por túnel SSH.
// No cambiar el proxy normal ni publicar este puerto en la red.
const adPilot = process.env.FLOTA_AD_PILOT === '1'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': adPilot
        ? { target: 'http://127.0.0.1:3002', changeOrigin: true }
        : 'http://localhost:3001',
    },
  },
})
