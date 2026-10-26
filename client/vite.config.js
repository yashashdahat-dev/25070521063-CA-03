import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Exposes on 0.0.0.0 so other devices on same Wi-Fi can access
    port: 5173
  }
})
