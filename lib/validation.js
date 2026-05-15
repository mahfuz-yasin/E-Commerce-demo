/**
 * Validation utilities for Facebook integration
 */

// Regex patterns for Facebook IDs and tokens
export const FACEBOOK_PATTERNS = {
  appId: /^\d{15,20}$/,
  pixelId: /^\d{15,20}$/,
  pageId: /^\d{15,20}$/,
  businessManagerId: /^\d{15,20}$/,
  adAccountId: /^act_\d{15,20}$|^\d{15,20}$/,
  catalogId: /^\d{15,20}$/,
  instagramBusinessId: /^\d{15,20}$/,
  whatsappBusinessId: /^\d{15,20}$/,
  accessToken: /^[A-Za-z0-9_-]{100,500}$/,
  appSecret: /^[A-Za-z0-9_-]{20,100}$/,
  url: /^https?:\/\/.+/,
  domain: /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/
}

/**
 * Validate a value against a regex pattern
 * @param {string} value - Value to validate
 * @param {string} patternName - Pattern name from FACEBOOK_PATTERNS
 * @returns {boolean} True if valid
 */
export function validatePattern(value, patternName) {
  if (!value) return false
  const pattern = FACEBOOK_PATTERNS[patternName]
  return pattern ? pattern.test(value) : false
}

/**
 * Validate HTTPS URL
 * @param {string} url - URL to validate
 * @returns {boolean} True if HTTPS
 */
export function validateHttps(url) {
  if (!url) return false
  return url.startsWith('https://')
}

/**
 * Sanitize log output to remove sensitive data
 * @param {any} data - Data to sanitize
 * @returns {any} Sanitized data
 */
export function sanitizeLog(data) {
  if (typeof data !== 'object' || data === null) return data
  
  const sensitiveKeys = ['token', 'secret', 'password', 'accessToken', 'appSecret', 'capiAccessToken']
  const sanitized = { ...data }
  
  Object.keys(sanitized).forEach(key => {
    if (sensitiveKeys.some(sensitiveKey => key.toLowerCase().includes(sensitiveKey.toLowerCase()))) {
      sanitized[key] = '[REDACTED]'
    }
  })
  
  return sanitized
}
