/**
 * Simple XSS Sanitizer
 * Sanitizes HTML content to prevent XSS attacks
 */

const ALLOWED_TAGS = ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'span', 'div']
const ALLOWED_ATTRIBUTES = ['class', 'style']

export function sanitizeHTML(html) {
  if (!html || typeof html !== 'string') return ''
  
  // Remove script tags and their content
  let sanitized = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
  
  // Remove event handlers (onclick, onload, etc.)
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
  
  // Remove javascript: URLs
  sanitized = sanitized.replace(/javascript\s*:\s*[^"']*/gi, '')
  
  // Remove iframe tags
  sanitized = sanitized.replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '')
  
  // Remove object/embed tags
  sanitized = sanitized.replace(/<(object|embed)[^>]*>[\s\S]*?<\/\1>/gi, '')
  
  // Remove form tags (to prevent form injection)
  sanitized = sanitized.replace(/<(form|input|button|select|textarea)[^>]*>[\s\S]*?<\/\1>/gi, '')
  
  return sanitized
}

export function sanitizeForDisplay(text) {
  if (!text || typeof text !== 'string') return ''
  
  // Escape HTML entities
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
