import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': {
        target: 'https://api-sandbox.factus.com.co', // URL del sandbox
        changeOrigin: true,
        secure: false, // Si la API utiliza certificados autofirmados
        rewrite: (path) => path.replace(/^\/auth/, ''), // Elimina el prefijo '/auth' en la llamada
      },
    },
  },
})
