import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
1
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001, // Change this to any port you prefer (e.g., 3000, 4000, 8080)
    strictPort: true, // Forces Vite to fail if the port is taken, rather than silently switching
  }
})
