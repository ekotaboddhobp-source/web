import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
     host: true, // ✅ এটি যোগ করো (রাউটারের অন্য ডিভাইস থেকে অ্যাক্সেসের জন্য)
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})