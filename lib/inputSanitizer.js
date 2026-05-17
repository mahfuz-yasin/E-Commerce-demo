/**
 * API Input Sanitization Middleware
 * Sanitizes user input to prevent injection attacks
 */

import { sanitizeHTML } from './xssSanitizer'

// NoSQL injection patterns to detect
const NOSQL_INJECTION_PATTERNS = [
  /\$where/i,
  /\$regex/i,
  /\$ne/i,
  /\$gt/i,
  /\$lt/i,
  /\$gte/i,
  /\$lte/i,
  /\$in/i,
  /\$nin/i,
  /\$or/i,
  /\$and/i,
  /\$not/i,
  /\$exists/i,
  /\$type/i,
  /\$mod/i,
  /\$size/i,
  /\$all/i,
  /\$elemMatch/i,
  /\$text/i,
  /\$expr/i,
]

// SQL injection patterns
const SQL_INJECTION_PATTERNS = [
  /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
  /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/i,
  /\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i,
  /((\%27)|(\'))union/i,
  /exec(\s|\+)+(s|x)p\w+/i,
  /UNION\s+SELECT/i,
  /INSERT\s+INTO/i,
  /DELETE\s+FROM/i,
  /DROP\s+TABLE/i,
  /ALTER\s+TABLE/i,
]

// Command injection patterns
const COMMAND_INJECTION_PATTERNS = [
  /;\s*\w+/i,
  /\|\s*\w+/i,
  /`.*`/i,
  /\$\(.*\)/i,
  /<script/i,
  /javascript:/i,
  /on\w+\s*=/i,
]

/**
 * Check if string contains injection patterns
 * @param {string} str - String to check
 * @returns {boolean}
 */
export function containsInjection(str) {
  if (typeof str !== 'string') return false
  
  const allPatterns = [
    ...NOSQL_INJECTION_PATTERNS,
    ...SQL_INJECTION_PATTERNS,
    ...COMMAND_INJECTION_PATTERNS
  ]
  
  return allPatterns.some(pattern => pattern.test(str))
}

/**
 * Sanitize a string value
 * @param {string} value - Value to sanitize
 * @returns {string}
 */
export function sanitizeString(value) {
  if (typeof value !== 'string') return value
  
  return value
    .replace(/[<>]/g, '') // Remove < and >
    .trim()
    .substring(0, 10000) // Limit length
}

/**
 * Sanitize an object recursively
 * @param {Object} obj - Object to sanitize
 * @returns {Object}
 */
export function sanitizeObject(obj) {
  if (obj === null || obj === undefined) return obj
  
  if (typeof obj === 'string') {
    return sanitizeString(obj)
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item))
  }
  
  if (typeof obj === 'object') {
    const sanitized = {}
    for (const [key, value] of Object.entries(obj)) {
      // Sanitize key as well
      const sanitizedKey = sanitizeString(key)
      sanitized[sanitizedKey] = sanitizeObject(value)
    }
    return sanitized
  }
  
  return obj
}

/**
 * Middleware to sanitize request body
 */
export function sanitizeRequestBody(handler) {
  return async function(request, ...args) {
    try {
      // Clone the request to read body
      const clonedRequest = request.clone()
      
      // Try to get and sanitize body
      let body = {}
      try {
        body = await clonedRequest.json()
      } catch {
        // Not JSON body, skip sanitization
        return handler(request, ...args)
      }
      
      // Check for injection attempts
      const stringifiedBody = JSON.stringify(body)
      if (containsInjection(stringifiedBody)) {
        return new Response(
          JSON.stringify({
            success: false,
            message: 'Invalid input detected'
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }
      
      // Sanitize the body
      const sanitizedBody = sanitizeObject(body)
      
      // Create new request with sanitized body
      const sanitizedRequest = new Request(request, {
        body: JSON.stringify(sanitizedBody)
      })
      
      return handler(sanitizedRequest, ...args)
      
    } catch (error) {
      console.error('Sanitization error:', error)
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Input processing error'
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
  }
}

/**
 * Middleware to validate and sanitize query parameters
 */
export function sanitizeQueryParams(handler) {
  return async function(request, ...args) {
    const url = new URL(request.url)
    
    // Check all query parameters for injection
    for (const [key, value] of url.searchParams) {
      if (containsInjection(key) || containsInjection(value)) {
        return new Response(
          JSON.stringify({
            success: false,
            message: 'Invalid query parameters'
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }
    }
    
    return handler(request, ...args)
  }
}

/**
 * Apply all security middleware
 * @param {Function} handler - API route handler
 * @param {Object} options - Middleware options
 */
export function withSecurity(handler, options = {}) {
  const { 
    sanitizeBody = true,
    sanitizeQuery = true,
    rateLimit = null
  } = options
  
  let wrappedHandler = handler
  
  if (sanitizeQuery) {
    wrappedHandler = sanitizeQueryParams(wrappedHandler)
  }
  
  if (sanitizeBody) {
    wrappedHandler = sanitizeRequestBody(wrappedHandler)
  }
  
  if (rateLimit) {
    const { createRateLimitMiddleware } = require('./redisRateLimiter')
    wrappedHandler = createRateLimitMiddleware(rateLimit)(wrappedHandler)
  }
  
  return wrappedHandler
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate phone number (Bangladesh format)
 * @param {string} phone - Phone number
 * @returns {boolean}
 */
export function isValidPhoneBD(phone) {
  const phoneRegex = /^(\+88)?01[3-9]\d{8}$/
  return phoneRegex.test(phone)
}

/**
 * Remove special characters from string
 * @param {string} str - String to clean
 * @returns {string}
 */
export function removeSpecialChars(str) {
  return str.replace(/[^a-zA-Z0-9\s\-_@.]/g, '')
}
