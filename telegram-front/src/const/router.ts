/**
 * Debe coincidir con `base` en vite.config y con `import.meta.env.BASE_URL`.
 * Sin barra final; si la app vive en la raíz del dominio, queda `undefined`.
 *
 * Si `BASE_URL` queda en `/` pero la URL real es `/telegramFront/...` (caché o
 * despliegue distinto), se infiere el basename desde `location` para que
 * `<Routes>` no queden sin coincidencia (pantalla en blanco).
 */
export const ROUTER_BASENAME: string | undefined = (() => {
  const trimmed = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
  if (trimmed !== '') {
    return trimmed === '/' ? undefined : trimmed;
  }
  if (typeof window !== 'undefined') {
    const { pathname } = window.location;
    if (pathname === '/telegramFront' || pathname.startsWith('/telegramFront/')) {
      return '/telegramFront';
    }
  }
  return undefined;
})();
