import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/graphql': 'http://localhost:8080',
    },
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'react-flow': ['reactflow'],
          'rrweb': ['rrweb-player', 'rrweb'],
          'ui-kit': ['@otelverse/ui-kit', 'lucide-react']
        }
      }
    }
  }
})
