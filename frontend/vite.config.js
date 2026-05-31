import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    css: {
      transformer: 'postcss',
    },
    build: {
      cssTarget: 'chrome80',
      chunkSizeWarningLimit: 1000,
    },
    server: {
      port: 5173,
      proxy: {
        // Local dev proxy — routes /api → backend (only used in dev)
        '/api': {
          target: env.VITE_API_URL
            ? env.VITE_API_URL.replace('/api', '')
            : 'http://localhost:8000',
          changeOrigin: true,
        },
      },
    },
  }
})

