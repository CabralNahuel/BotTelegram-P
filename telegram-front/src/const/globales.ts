export const RUTAS = {
  PRODUCCION: import.meta.env.VITE_PRODUCCION,
  DESARROLLO: import.meta.env.VITE_DESARROLLO,
};

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Segmento bajo el proxy (ej. `apis/infobot`). Sin barras al inicio/fin.
 * En local, vacío si Node expone `/login` en la raíz del `VITE_API_BASE_URL`.
 */
export const API_PATH_PREFIX = String(import.meta.env.VITE_API_PATH_PREFIX ?? '')
  .trim()
  .replace(/^\/+|\/+$/g, '');
