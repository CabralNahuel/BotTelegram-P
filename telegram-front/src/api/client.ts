import { API_BASE_URL, API_PATH_PREFIX } from '../const/globales';

/**
 * URL absoluta del backend. `path` debe empezar con `/` (p. ej. `/home/menues`).
 * Antepone `VITE_API_PATH_PREFIX` (p. ej. apis/infobot) cuando el proxy publica el API bajo ese path.
 */
export function apiUrl(path: string): string {
  const base = (API_BASE_URL ?? '').replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  const pre = API_PATH_PREFIX ? `/${API_PATH_PREFIX}` : '';
  const baseLc = base.toLowerCase();
  const preLc = pre.toLowerCase();
  if (pre && baseLc.endsWith(preLc)) {
    return `${base}${p}`;
  }
  return `${base}${pre}${p}`;
}

/**
 * `fetch` al API con cabeceras por defecto. Si hay body y no es FormData, añade `Content-Type: application/json`.
 * Para añadir Authorization en el futuro, centralizar aquí.
 */
export function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const url = apiUrl(path);
  const headers = new Headers(init?.headers);
  const body = init?.body;
  const hasBody = body !== undefined && body !== null && body !== '';
  if (hasBody && !(body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  return fetch(url, { ...init, headers });
}
