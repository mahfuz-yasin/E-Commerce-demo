/**
 * Security Middleware Usage Examples
 * 
 * This file demonstrates how to use the security features in your API routes.
 */

import { createRateLimitMiddleware, rateLimits } from './redisRateLimiter'
import { withSecurity } from './inputSanitizer'
import { setAPISecurityHeaders } from './securityHeaders'

// Example 1: Basic rate limiting for auth routes
// Usage in route.js:
/*
import { createRateLimitMiddleware, rateLimits } from '@/lib/redisRateLimiter'

const rateLimit = createRateLimitMiddleware(rateLimits.strict)

export async function POST(request) {
  // Check rate limit
  const rateLimitResult = await rateLimit(request)
  if (rateLimitResult) {
    return rateLimitResult // Returns 429 if limited
  }
  
  // Your route logic here
}
*/

// Example 2: Using withSecurity wrapper (recommended)
// This applies body sanitization, query sanitization, and rate limiting
/*
import { withSecurity, rateLimits } from '@/lib/inputSanitizer'

async function handler(request) {
  // Your route logic here
  // Request body is already sanitized
}

export const POST = withSecurity(handler, {
  sanitizeBody: true,
  sanitizeQuery: true,
  rateLimit: rateLimits.standard
})
*/

// Example 3: Manual sanitization
/*
import { sanitizeObject, containsInjection } from '@/lib/inputSanitizer'

export async function POST(request) {
  const body = await request.json()
  
  // Check for injection attempts
  if (containsInjection(JSON.stringify(body))) {
    return new Response(
      JSON.stringify({ success: false, message: 'Invalid input' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }
  
  // Sanitize input
  const sanitized = sanitizeObject(body)
  
  // Continue with sanitized data
}
*/

// Example 4: Adding security headers to response
/*
import { setAPISecurityHeaders } from '@/lib/securityHeaders'

export async function GET(request) {
  // Your logic
  
  const response = new Response(
    JSON.stringify({ success: true, data }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
  
  // Apply security headers
  return setAPISecurityHeaders(response)
}
*/

// Example 5: Complete secure API route
/*
import { withSecurity, rateLimits } from '@/lib/inputSanitizer'
import { isAuthenticated } from '@/lib/authentication'
import { setAPISecurityHeaders } from '@/lib/securityHeaders'
import { connectDB } from '@/lib/databaseConnection'
import { response } from '@/lib/helperFunction'

async function createProductHandler(request) {
  // Authentication check
  const auth = await isAuthenticated('admin')
  if (!auth.isAuth) {
    const res = response(false, 403, 'Unauthorized')
    return setAPISecurityHeaders(res)
  }
  
  // Get sanitized body
  const body = await request.json()
  
  // Database operations
  await connectDB()
  // ... create product
  
  const res = response(true, 200, 'Product created', product)
  return setAPISecurityHeaders(res)
}

// Export with full security
export const POST = withSecurity(createProductHandler, {
  sanitizeBody: true,
  sanitizeQuery: true,
  rateLimit: rateLimits.standard
})
*/

// Example 6: Using Redis rate limit with custom config
/*
import { createRateLimitMiddleware } from '@/lib/redisRateLimiter'

const customRateLimit = createRateLimitMiddleware({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // 20 requests per 5 minutes
  message: 'Too many requests from this IP'
})

export async function POST(request) {
  const rateLimitResult = await customRateLimit(request)
  if (rateLimitResult) return rateLimitResult
  
  // Your logic
}
*/

export default {
  message: 'See comments above for usage examples'
}
