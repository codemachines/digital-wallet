import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/auth': 'http://localhost:8080',
      '/credential': 'http://localhost:8080',
      '/credentials': 'http://localhost:8080',
      '/wallet': 'http://localhost:8080',
      '/issuer': 'http://localhost:8080',
      '/verify': 'http://localhost:8080',
      '/verification': 'http://localhost:8080',
    }
  }
})
