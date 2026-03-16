import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // 提高 warning 阈值，避免分包后仍然触发警告
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // React 核心单独一包，几乎不变，浏览器可长期缓存
          'vendor-react': ['react', 'react-dom'],
          // framer-motion 很大，单独分出来
          'vendor-motion': ['framer-motion'],
          // 图标库单独分出来
          'vendor-icons': ['@phosphor-icons/react'],
        },
      },
    },
  },
})
