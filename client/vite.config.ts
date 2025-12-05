import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        ws: true,
      },
    },
  },
  css: {
    postcss: './postcss.config.js',
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Regroupement par package
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor'
            }
            if (id.includes('lucide-react') || id.includes('react-hot-toast')) {
              return 'ui'
            }
            if (id.includes('chart.js') || id.includes('react-chartjs-2')) {
              return 'charts'
            }
            if (id.includes('axios') || id.includes('socket.io-client') || id.includes('zod')) {
              return 'utils'
            }
            
            return 'vendor'
          }
        }
      }
    },
    sourcemap: true,
  },
})