import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'

export default defineConfig(() => {
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      proxy: {
        // Proxy API calls to backend during development when using relative '/api'
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          // Strip /api if backend already has /api prefix; here backend mounts routers at /api so keep it
          // rewrite: path => path.replace(/^\/api/, ''), // Uncomment if backend endpoints don't include /api
        },
      },
    },
    build: {
      sourcemap: true,
    },
  }
})
