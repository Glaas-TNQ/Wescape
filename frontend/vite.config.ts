import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'use-sync-external-store/shim/with-selector': path.resolve(
        __dirname, 'node_modules/use-sync-external-store/shim/with-selector.js'
      )
    }
  },
  optimizeDeps: {
    include: ['reactflow', '@reactflow/core', 'zustand', 'use-sync-external-store'],
    exclude: [],
    force: true
  },
  server: { port: 5180 }
})
