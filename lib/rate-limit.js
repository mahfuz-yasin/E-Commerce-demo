import { rateLimit as rateLimitFunc } from '@/lib/google-validation'

/**
 * Rate limiter middleware for API routes
 * Uses in-memory storage (for production, use Redis)
 */
export function rateLimitMiddleware(key, maxRequests = 10, windowMs = 60000) {
  return function(request, response, next) {
    const result = rateLimitFunc(key, maxRequests, windowMs)
    
    if (!result.allowed) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': result.resetTime.toString()
          }
        }
      )
    }
    
    // Add rate limit headers to response
    response.headers.set('X-RateLimit-Limit', maxRequests.toString())
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
    response.headers.set('X-RateLimit-Reset', result.resetTime.toString())
    
    return next()
  }
}
