import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // CloudBase 静态托管常部署在子路径（如 /quanzhenghe/），用相对路径避免资源 404 白屏
  base: './',
  plugins: [react()],
})
