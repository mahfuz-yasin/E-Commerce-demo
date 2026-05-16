import { connectDB } from "@/lib/databaseConnection"
import mongoose from 'mongoose'

const rateLimitSchema = new mongoose.Schema({
  identifier: {
    type: String,
    required: true,
    unique: true
  },
  count: {
    type: Number,
    default: 0
  },
  resetTime: {
    type: Date,
    required: true
  }
})

rateLimitSchema.index({ identifier: 1, resetTime: 1 })

const RateLimitModel = mongoose.models.RateLimit || mongoose.model('RateLimit', rateLimitSchema)

/**
 * Simple rate limiter for API routes
 * @param {string} identifier - Unique identifier (IP address, user ID, etc.)
 * @param {number} limit - Maximum requests per window
 * @param {number} windowMs - Window duration in milliseconds
 * @returns {Promise<boolean>} Whether the request is allowed
 */
export async function checkRateLimit(identifier, limit = 100, windowMs = 60000) {
  try {
    await connectDB()

    const now = new Date()
    const resetTime = new Date(now.getTime() + windowMs)

    // Find or create rate limit record
    let rateLimit = await RateLimitModel.findOne({ identifier })

    if (!rateLimit) {
      rateLimit = await RateLimitModel.create({
        identifier,
        count: 1,
        resetTime
      })
      return true
    }

    // Check if window has expired
    if (rateLimit.resetTime < now) {
      rateLimit.count = 1
      rateLimit.resetTime = resetTime
      await rateLimit.save()
      return true
    }

    // Check if limit exceeded
    if (rateLimit.count >= limit) {
      return false
    }

    // Increment count
    rateLimit.count += 1
    await rateLimit.save()

    return true
  } catch (error) {
    console.error('Rate limit check error:', error)
    // Allow request if rate limit check fails
    return true
  }
}

/**
 * Clean up expired rate limit records
 */
export async function cleanupExpiredRateLimits() {
  try {
    await connectDB()
    await RateLimitModel.deleteMany({ resetTime: { $lt: new Date() } })
  } catch (error) {
    console.error('Rate limit cleanup error:', error)
  }
}

export default RateLimitModel
