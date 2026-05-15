import crypto from 'crypto'

// Get encryption key from environment variable or use a default key
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex')
const ALGORITHM = 'aes-256-cbc'
const IV_LENGTH = 16

/**
 * Encrypt text using AES-256-CBC
 * @param {string} text - Text to encrypt
 * @returns {string} Encrypted text in format: iv:encrypted
 */
export function encrypt(text) {
  if (!text) return ''
  
  try {
    const iv = crypto.randomBytes(IV_LENGTH)
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32)
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
    
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    return `${iv.toString('hex')}:${encrypted}`
  } catch (error) {
    console.error('Encryption error:', error)
    throw new Error('Failed to encrypt data')
  }
}

/**
 * Decrypt text using AES-256-CBC
 * @param {string} encryptedText - Encrypted text in format: iv:encrypted
 * @returns {string} Decrypted text
 */
export function decrypt(encryptedText) {
  if (!encryptedText) return ''
  
  try {
    const parts = encryptedText.split(':')
    if (parts.length !== 2) {
      // Handle backward compatibility if text is not encrypted
      return encryptedText
    }
    
    const iv = Buffer.from(parts[0], 'hex')
    const encrypted = parts[1]
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32)
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  } catch (error) {
    console.error('Decryption error:', error)
    // Return as-is if decryption fails (backward compatibility)
    return encryptedText
  }
}

/**
 * Encrypt object fields recursively
 * @param {object} obj - Object to encrypt
 * @param {string[]} fields - Array of field names to encrypt
 * @returns {object} Object with encrypted fields
 */
export function encryptFields(obj, fields) {
  if (!obj || typeof obj !== 'object') return obj
  
  const result = { ...obj }
  fields.forEach(field => {
    if (result[field]) {
      result[field] = encrypt(result[field])
    }
  })
  return result
}

/**
 * Decrypt object fields recursively
 * @param {object} obj - Object to decrypt
 * @param {string[]} fields - Array of field names to decrypt
 * @returns {object} Object with decrypted fields
 */
export function decryptFields(obj, fields) {
  if (!obj || typeof obj !== 'object') return obj
  
  const result = { ...obj }
  fields.forEach(field => {
    if (result[field]) {
      result[field] = decrypt(result[field])
    }
  })
  return result
}

/**
 * Mask sensitive data for display (show only last 4 characters)
 * @param {string} text - Text to mask
 * @returns {string} Masked text
 */
export function maskSensitiveData(text) {
  if (!text || text.length <= 4) return '****'
  return '*'.repeat(text.length - 4) + text.slice(-4)
}
