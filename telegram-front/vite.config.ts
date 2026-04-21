import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Barra final recomendada por Vite; debe alinearse con ROUTER_BASENAME
  base: '/telegramFront/',
  server: {
    
    port: 4001, 
  },
});