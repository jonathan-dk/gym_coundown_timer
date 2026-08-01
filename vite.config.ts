import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Gym Møntenedtæller',
        short_name: 'GymMønter',
        description: 'Hold styr på dine Pokémon gym-møntindtægter og nedtællingsur.',
        lang: 'da',
        theme_color: '#aa3bff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
          },
        ],
      },
    }),
  ],
  server: {
    port: 3002, // Change this to any port you prefer (e.g., 3000, 4000, 8080)
    strictPort: true, // Forces Vite to fail if the port is taken, rather than silently switching
  }
})
