import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@assets": path.resolve(__dirname, "src/assets"),
      "@components": path.resolve(__dirname, "src/components"),
      "@ui": path.resolve(__dirname, "src/components/ui"),
      "@views": path.resolve(__dirname, "src/views"),
      "@hooks": path.resolve(__dirname, "src/hooks"),
      "@core": path.resolve(__dirname, "src/core"),
      "@auth": path.resolve(__dirname, "src/auth"),
      "@config": path.resolve(__dirname, "src/core/config"),
    },
  },
})
