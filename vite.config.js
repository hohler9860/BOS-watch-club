import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/BOS-watch-club/',
  server: {
    host: '127.0.0.1',
    port: 5173,
  },
})
