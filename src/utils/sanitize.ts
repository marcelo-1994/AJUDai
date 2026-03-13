import DOMPurify from 'dompurify';

/**
 * Sanitiza strings para prevenir ataques de XSS (Cross-Site Scripting).
 * Deve ser usado antes de renderizar qualquer conteúdo gerado por usuários (ex: descrições de pedidos).
 */
export const sanitizeHtml = (dirtyHtml: string): string => {
  if (!dirtyHtml) return '';
  
  return DOMPurify.sanitize(dirtyHtml, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  });
};
