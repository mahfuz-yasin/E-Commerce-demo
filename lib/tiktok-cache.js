import mongoose from 'mongoose'

const cacheSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }
  }
})

const TikTokCacheModel = mongoose.models.TikTokCache || mongoose.model('TikTokCache', cacheSchema)

/**
 * Get cached data
 * @param {string} key - Cache key
 * @returns {Promise<any>} Cached value or null
 */
export async function getCachedData(key) {
  try {
    const cached = await TikTokCacheModel.findOne({ key, expiresAt: { $gt: new Date() } })
    return cached ? cached.value : null
  } catch (error) {
    console.error('Error getting cached data:', error)
    return null
  }
}

/**
 * Set cached data
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} ttl - Time to live in seconds (default: 300 = 5 minutes)
 */
export async function setCachedData(key, value, ttl = 300) {
  try {
    const expiresAt = new Date(Date.now() + (ttl * 1000))
    await TikTokCacheModel.findOneAndUpdate(
      { key },
      { value, expiresAt },
      { upsert: true, new: true }
    )
  } catch (error) {
    console.error('Error setting cached data:', error)
  }
}

/**
 * Delete cached data
 * @param {string} key - Cache key
 */
export async function deleteCachedData(key) {
  try {
    await TikTokCacheModel.deleteOne({ key })
  } catch (error) {
    console.error('Error deleting cached data:', error)
  }
}

/**
 * Clear all expired cache entries
 */
export async function clearExpiredCache() {
  try {
    await TikTokCacheModel.deleteMany({ expiresAt: { $lt: new Date() } })
  } catch (error) {
    console.error('Error clearing expired cache:', error)
  }
}

export default TikTokCacheModel
