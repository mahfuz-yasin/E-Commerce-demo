/**
 * Redis-based Rate Limiter for Production
 * Requires Redis connection string in REDIS_URL env variable
 */

import { Redis } from 'ioredis'

let redis = null

// Initialize Redis connection
function getRedis() {
  if (!redis && process.env.REDIS_URL) {
    redis = new Redis(process.env.REDIS_URL, {
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000)
        return delay
      },
      maxRetriesPerRequest: 3,
    })
    
    redis.on('error', (err) => {
      console.error('Redis error:', err)
    })
  }
  return redis
}

/**
 * Check if request is rate limited
 * @param {string} identifier - Unique identifier (IP, user ID, etc.)
 * @param {number} limit - Max requests per window
 * @param {number} window - Time window in seconds
 * @returns {Promise<{limited: boolean, remaining: number, resetTime: number}>}
 */
export async function checkRateLimit(identifier, limit = 100, window = 60) {
  // Fallback to memory-based if Redis not available
  if (!process.env.REDIS_URL || !getRedis()) {
    console.warn('Redis not configured, using memory-based rate limiting')
    return checkMemoryRateLimit(identifier, limit, window)
  }
  
  const key = `rate_limit:${identifier}`
  const now = Math.floor(Date.now() / 1000)
  const windowStart = now - window
  
  try {
    const redisClient = getRedis()
    
    // Remove old entries outside the window
    await redisClient.zremrangebyscore(key, 0, windowStart)
    
    // Count requests in current window
    const count = await redisClient.zcard(key)
    
    if (count >= limit) {
      // Get oldest request timestamp for reset time
      const oldest = await redisClient.zrange(key, 0, 0, 'WITHSCORES')
      const resetTime = parseInt(oldest[1]) + window
      
      return {
        limited: true,
        remaining: 0,
        resetTime
      }
    }
    
    // Add current request
    await redisClient.zadd(key, now, `${now}:${Math.random()}`)
    
    // Set expiry on the key
    await redisClient.expire(key, window)
    
    return {
      limited: false,
      remaining: limit - count - 1,
      resetTime: now + window
    }
    
  } catch (error) {
    console.error('Redis rate limit error:', error)
    // Allow request if Redis fails
    return { limited: false, remaining: 1, resetTime: now + window }
  }
}

// In-memory fallback
const memoryRateLimits = new Map()

function checkMemoryRateLimit(identifier, limit, window) {
  const key = identifier
  const now = Date.now()
  const windowMs = window * 1000
  
  const data = memoryRateLimits.get(key) || { requests: [], resetTime: now + windowMs }
  
  // Clean old requests
  data.requests = data.requests.filter(time => time > now - windowMs)
  
  if (data.requests.length >= limit) {
    return {
      limited: true,
      remaining: 0,
      resetTime: Math.floor(data.resetTime / 1000)
    }
  }
  
  data.requests.push(now)
  memoryRateLimits.set(key, data)
  
  return {
    limited: false,
    remaining: limit - data.requests.length,
    resetTime: Math.floor((now + windowMs) / 1000)
  }
}

/**
 * Rate limit middleware for API routes
 * @param {Object} options - Rate limit options
 */
export function createRateLimitMiddleware(options = {}) {
  const {
    windowMs = 60000, // 1 minute
    max = 100, // max requests per window
    keyGenerator = (req) => req.ip || req.headers.get('x-forwarded-for') || 'unknown',
    skipSuccessfulRequests = false,
    message = 'Too many requests, please try again later.'
  } = options
  
  return async function rateLimitMiddleware(request) {
    const identifier = keyGenerator(request)
    const windowSeconds = Math.floor(windowMs / 1000)
    
    const result = await checkRateLimit(identifier, max, windowSeconds)
    
    if (result.limited) {
      return new Response(
        JSON.stringify({
          success: false,
          message,
          retryAfter: result.resetTime - Math.floor(Date.now() / 1000)
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(result.resetTime - Math.floor(Date.now() / 1000))
          }
        }
      )
    }
    
    return null // Continue to next handler
  }
}

// Predefined rate limit configurations
export const rateLimits = {
  // Strict: For auth endpoints (login, register, etc.)
  strict: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: 'Too many attempts. Please try again after 15 minutes.'
  },
  
  // Standard: For general API usage
  standard: {
    windowMs: 60 * 1000, // 1 minute
    max: 100,
    message: 'Rate limit exceeded. Please slow down.'
  },
  
  // Generous: For public endpoints
  generous: {
    windowMs: 60 * 1000, // 1 minute
    max: 300,
    message: 'Too many requests.'
  },
  
  // Webhook: For webhook endpoints
  webhook: {
    windowMs: 60 * 1000, // 1 minute
    max: 1000,
    message: 'Webhook rate limit exceeded.'
  }
}
