import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';

// Create a JSDOM window for DOMPurify (server-side)
const window = new JSDOM('').window;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const purify = DOMPurify(window as any);

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param dirty HTML string to sanitize
 * @param options Optional DOMPurify configuration
 * @returns Sanitized HTML string
 */
export function sanitizeHtml(dirty: string, options?: DOMPurify.Config): string {
  if (!dirty) return '';
  
  const defaultConfig = {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'code', 'pre',
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class'],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  };
  
  const config = options ? { ...defaultConfig, ...options } : defaultConfig;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return purify.sanitize(dirty, config as any) as unknown as string;
}

/**
 * Sanitize plain text (removes HTML)
 * @param text Text to sanitize
 * @returns Plain text without HTML
 */
export function sanitizeText(text: string): string {
  if (!text) return '';
  return purify.sanitize(text, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}

