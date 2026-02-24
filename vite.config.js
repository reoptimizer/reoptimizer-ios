import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // All requests to /api/mobile/* are forwarded to the staging server.
      // The browser only ever talks to localhost, so CORS is never an issue.
      '/api/mobile': {
        target: 'https://stage.reoptimizer.ai',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
