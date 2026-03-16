import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': 'http://localhost:8080',
      '/issuer': 'http://localhost:8080',
      '/wallet': 'http://localhost:8080',
      '/verify': 'http://localhost:8080',
      '/verification': 'http://localhost:8080',
    }
  }
})
