/**
 * Simple in-memory rate limiter for API routes
 * For production, consider using Redis-based rate limiting
 */

const rateLimitMap = new Map()

/**
 * Rate limiter middleware
 * @param {number} limit - Max requests per window
 * @param {number} window - Time window in milliseconds
 * @param {string} identifier - Unique identifier for the rate limit
 */
export function rateLimit(limit = 10, window = 60000, identifier = 'default') {
  return async (request) => {
    const key = `${identifier}:${request.headers.get('x-forwarded-for') || request.ip || 'unknown'}`
    const now = Date.now()
    
    const data = rateLimitMap.get(key) || { count: 0, resetTime: now + window }
    
    if (now > data.resetTime) {
      data.count = 0
      data.resetTime = now + window
    }
    
    if (data.count >= limit) {
      return {
        success: false,
        error: 'Rate limit exceeded',
        resetTime: data.resetTime
      }
    }
    
    data.count++
    rateLimitMap.set(key, data)
    
    return { success: true }
  }
}

/**
 * Cleanup expired rate limit entries
 */
export function cleanupRateLimiter() {
  const now = Date.now()
  for (const [key, data] of rateLimitMap.entries()) {
    if (now > data.resetTime) {
      rateLimitMap.delete(key)
    }
  }
}

// Cleanup expired entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimiter, 5 * 60 * 1000)
}
