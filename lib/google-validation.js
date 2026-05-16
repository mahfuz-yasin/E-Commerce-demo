import crypto from 'crypto'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex')
const IV_LENGTH = 16

/**
 * Encrypt data using AES-256
 */
export function encrypt(data) {
  if (!data) return ''
  try {
    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv)
    let encrypted = cipher.update(data, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    return iv.toString('hex') + ':' + encrypted
  } catch (error) {
    console.error('Encryption error:', error)
    return data
  }
}

/**
 * Decrypt data using AES-256
 */
export function decrypt(encryptedData) {
  if (!encryptedData) return ''
  try {
    const parts = encryptedData.split(':')
    if (parts.length !== 2) return encryptedData
    const iv = Buffer.from(parts[0], 'hex')
    const encrypted = parts[1]
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv)
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  } catch (error) {
    console.error('Decryption error:', error)
    return encryptedData
  }
}

/**
 * Validate GA4 Measurement ID format
 * Format: G-[A-Z0-9]{5,10}
 */
export function validateGA4MeasurementId(measurementId) {
  const regex = /^G-[A-Z0-9]{5,10}$/
  return regex.test(measurementId)
}

/**
 * Validate Google Ads Customer ID format
 * Format: 123-456-7890 (3 groups of 3-4 digits)
 */
export function validateGoogleAdsCustomerId(customerId) {
  const regex = /^[0-9]{3}-[0-9]{3}-[0-9]{4}$/
  return regex.test(customerId)
}

/**
 * Validate GTM Container ID format
 * Format: GTM-XXXXXXX
 */
export function validateGTMContainerId(containerId) {
  const regex = /^GTM-[A-Z0-9]{7}$/
  return regex.test(containerId)
}

/**
 * Validate Merchant Center ID format
 * Format: 12-digit number
 */
export function validateMerchantCenterId(merchantId) {
  const regex = /^[0-9]{12}$/
  return regex.test(merchantId)
}

/**
 * Validate URL format
 */
export function validateURL(url) {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Sanitize input to prevent XSS
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

/**
 * Rate limiter implementation (in-memory, for production use Redis)
 */
const rateLimitMap = new Map()

export function rateLimit(key, maxRequests = 10, windowMs = 60000) {
  const now = Date.now()
  const requests = rateLimitMap.get(key) || { count: 0, resetTime: now + windowMs }
  
  if (now > requests.resetTime) {
    requests.count = 0
    requests.resetTime = now + windowMs
  }
  
  requests.count++
  rateLimitMap.set(key, requests)
  
  return {
    allowed: requests.count <= maxRequests,
    remaining: maxRequests - requests.count,
    resetTime: requests.resetTime
  }
}

/**
 * Generate CSRF token
 */
export function generateCSRFToken() {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Validate CSRF token
 */
export function validateCSRFToken(token, sessionToken) {
  return token === sessionToken
}
