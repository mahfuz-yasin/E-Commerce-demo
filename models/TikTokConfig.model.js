import mongoose from 'mongoose'
import crypto from 'crypto'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32)
const IV_LENGTH = 16

/**
 * Encrypt data using AES-256-CBC
 * @param {string} text - Text to encrypt
 * @returns {string} Encrypted text
 */
function encrypt(text) {
    if (!text) return ''
    const iv = crypto.randomBytes(IV_LENGTH)
    const key = Buffer.from(ENCRYPTION_KEY, 'hex') || Buffer.from(ENCRYPTION_KEY)
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    return iv.toString('hex') + ':' + encrypted
}

/**
 * Decrypt data using AES-256-CBC
 * @param {string} text - Text to decrypt
 * @returns {string} Decrypted text
 */
function decrypt(text) {
    if (!text) return ''
    const textParts = text.split(':')
    const iv = Buffer.from(textParts.shift(), 'hex')
    const encryptedText = textParts.join(':')
    const key = Buffer.from(ENCRYPTION_KEY, 'hex') || Buffer.from(ENCRYPTION_KEY)
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
}

const tikTokConfigSchema = new mongoose.Schema({
  // Pixel & Events API
  pixelId: {
    type: String,
    required: false,
    set: (value) => {
      if (value && !/^[0-9]{15,20}$/.test(value)) {
        throw new Error('Invalid Pixel ID format. Must be 15-20 digits.')
      }
      return encrypt(value)
    },
    get: (value) => decrypt(value)
  },
  accessToken: {
    type: String,
    required: false,
    set: (value) => encrypt(value),
    get: (value) => decrypt(value)
  },
  refreshToken: {
    type: String,
    required: false,
    set: (value) => encrypt(value),
    get: (value) => decrypt(value)
  },
  tokenExpiry: {
    type: Date,
    required: false
  },
  
  // Business Center & Ads
  businessCenterId: {
    type: String,
    required: false,
    set: (value) => encrypt(value),
    get: (value) => decrypt(value)
  },
  adAccountId: {
    type: String,
    required: false,
    set: (value) => encrypt(value),
    get: (value) => decrypt(value)
  },
  appId: {
    type: String,
    required: false,
    set: (value) => encrypt(value),
    get: (value) => decrypt(value)
  },
  appSecret: {
    type: String,
    required: false,
    set: (value) => encrypt(value),
    get: (value) => decrypt(value)
  },
  
  // Catalog
  catalogId: {
    type: String,
    required: false,
    set: (value) => encrypt(value),
    get: (value) => decrypt(value)
  },
  catalogFeedUrl: {
    type: String,
    required: false
  },
  offlineEventSetId: {
    type: String,
    required: false,
    set: (value) => encrypt(value),
    get: (value) => decrypt(value)
  },
  
  // Webhooks
  webhookSecret: {
    type: String,
    required: false,
    set: (value) => encrypt(value),
    get: (value) => decrypt(value)
  },
  webhookVerifyToken: {
    type: String,
    required: false,
    set: (value) => encrypt(value),
    get: (value) => decrypt(value)
  },
  
  // Spark Ads
  sparkPostIds: {
    type: [String],
    default: []
  },
  
  // Test event code for debugging
  testEventCode: {
    type: String,
    required: false
  },
  
  // 2026 Enterprise Standards
  syncTikTokShop: {
    type: Boolean,
    default: false
  },
  liveTrackingEnabled: {
    type: Boolean,
    default: false
  },
  enableLDU: {
    type: Boolean,
    default: false
  },
  creativeAutoRefresh: {
    type: Boolean,
    default: false
  },
  apiSchemaVersion: {
    type: String,
    default: 'v1.4'
  },
  
  // Status flags
  isPixelActive: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'inactive'
  },
  isCAPIActive: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'inactive'
  },
  isCatalogActive: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'inactive'
  },
  
  // API version
  apiVersion: {
    type: String,
    default: 'v1.3'
  }
}, {
  timestamps: true
})

tikTokConfigSchema.index({ isPixelActive: 1 })
tikTokConfigSchema.index({ isCAPIActive: 1 })
tikTokConfigSchema.index({ isCatalogActive: 1 })

tikTokConfigSchema.statics.getConfig = async function() {
    let config = await this.findOne()
    if (!config) {
        config = await this.create({})
    }
    return config
}

const TikTokConfigModel = mongoose.models.TikTokConfig || mongoose.model('TikTokConfig', tikTokConfigSchema)
export default TikTokConfigModel
