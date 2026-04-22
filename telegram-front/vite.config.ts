import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // En Netlify/Vercel la app vive en la raíz: VITE_BASE=/. Para despliegues bajo prefijo
  // (ej. VPS con proxy /telegramFront/) usar VITE_BASE=/telegramFront/.
  const base = env.VITE_BASE || '/';

  return {
    plugins: [react()],
    base,
    server: {
      port: 4001,
    },
  };
});
