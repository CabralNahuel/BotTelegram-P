import DOMPurify from 'dompurify';

/** Etiquetas que el panel permite en mensajes enriquecidos (Telegram / editor). */
const ALLOWED_TAGS = ['b', 'strong', 'i', 'em', 'u', 'br', 'p', 'div', 'span', 'a'];

const SANITIZE_HTML: DOMPurify.Config = {
  ALLOWED_TAGS,
  ALLOWED_ATTR: ['href', 'target', 'rel'],
};

/**
 * HTML seguro para renderizar con dangerouslySetInnerHTML.
 * Elimina scripts, on* handlers y etiquetas no permitidas.
 */
export function sanitizeHtml(dirty: string): string {
  const out = DOMPurify.sanitize(dirty ?? '', SANITIZE_HTML);
  return typeof out === 'string' ? out : '';
}

/**
 * Texto plano para títulos de diálogo, confirmaciones o tooltips (sin etiquetas).
 */
export function htmlToPlainText(html: string): string {
  if (typeof document === 'undefined') {
    return DOMPurify.sanitize(html ?? '', { ALLOWED_TAGS: [] });
  }
  const div = document.createElement('div');
  div.innerHTML = sanitizeHtml(html ?? '');
  return div.textContent ?? div.innerText ?? '';
}
