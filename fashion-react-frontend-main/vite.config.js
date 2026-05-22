import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: { chunkSizeWarningLimit: 1600, },
  server: {
    port: 3005,
    strictPort: true,
    host: 'localhost',
    proxy: {
      '/api': { target: 'http://localhost:8080', changeOrigin: true },
      '/photos': { target: 'http://localhost:8080', changeOrigin: true },
    },
  },
})
