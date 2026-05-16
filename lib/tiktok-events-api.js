import crypto from 'crypto'
import axios from 'axios'
import TikTokConfigModel from '@/models/TikTokConfig.model'
import { connectDB } from '@/lib/databaseConnection'

const MAX_RETRIES = 3

/**
 * Hash data using SHA256 (required by TikTok Events API)
 * @param {string} data - Data to hash
 * @returns {string} SHA256 hash
 */
function hashSHA256(data) {
  if (!data) return ''
  return crypto.createHash('sha256').update(normalizeData(data)).digest('hex')
}

/**
 * Normalize data before hashing (lowercase, trim) - v1.4+ compliant
 * @param {string} data - Data to normalize
 * @returns {string} Normalized data
 */
function normalizeData(data) {
  if (!data) return ''
  return data.toString().toLowerCase().trim()
}

/**
 * Detect user region from IP address for privacy compliance
 * @param {string} ipAddress - User's IP address
 * @returns {object} Region detection result
 */
function detectRegion(ipAddress) {
  // This is a simplified implementation
  // In production, use a proper IP geolocation service
  const euRegions = ['EU', 'GB', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'SE', 'DK', 'FI', 'PL', 'PT', 'GR', 'CZ', 'HU', 'RO', 'BG', 'HR', 'SI', 'SK', 'LT', 'LV', 'IE', 'MT', 'CY', 'LU']
  const usRegions = ['US', 'CA']
  
  // Placeholder - in production, use actual IP geolocation
  // For now, we'll check if IP is in certain ranges
  return {
    isEU: false,
    isCalifornia: false,
    region: 'UNKNOWN'
  }
}

/**
 * Generate UUID v4 for event deduplication
 * @returns {string} UUID
 */
export function generateTikTokEventId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * Extract ttclid from _ttp cookie or URL parameter
 * @param {object} headers - Request headers
 * @param {string} url - Request URL
 * @returns {string|null} TikTok Click ID
 */
export function extractTikTokClickId(headers, url) {
  // Try to get from _ttp cookie
  const cookies = headers.cookie || headers.Cookie || ''
  const ttpCookieMatch = cookies.match(/_ttp=([^;]+)/)
  if (ttpCookieMatch) {
    return ttpCookieMatch[1]
  }

  // Try to get from URL parameter
  try {
    const urlObj = new URL(url)
    const ttclid = urlObj.searchParams.get('ttclid')
    if (ttclid) {
      return ttclid
    }
  } catch (error) {
    console.error('Error parsing URL for ttclid:', error)
  }

  return null
}

/**
 * Send event to TikTok Events API (Server-side) - v1.4+ compliant
 * @param {string} eventName - Event name (ViewContent, AddToCart, etc.)
 * @param {object} eventData - Event data (content_ids, value, currency, etc.)
 * @param {object} userData - User data (email, phone, ip, user_agent)
 * @param {string} eventId - Unique event ID for deduplication
 * @param {object} options - Additional options (test_event_code, url, headers, privacy)
 * @returns {Promise} Response from TikTok
 */
export async function sendTikTokEvent(eventName, eventData = {}, userData = {}, eventId = null, options = {}) {
  let retryCount = 0

  while (retryCount < MAX_RETRIES) {
    try {
      await connectDB()

      const config = await TikTokConfigModel.getConfig()

      if (!config.pixelId || !config.accessToken || config.isCAPIActive !== 'active') {
        console.warn('TikTok CAPI not configured or inactive')
        return { success: false, message: 'TikTok CAPI not configured or inactive' }
      }

      const finalEventId = eventId || generateTikTokEventId()
      const apiVersion = config.apiSchemaVersion || 'v1.4'
      const testEventCode = config.testEventCode || options.test_event_code

      // Detect user region for privacy compliance
      const regionData = detectRegion(userData.ipAddress)
      const enableLDU = config.enableLDU || false

      // Hash user data (Advanced Matching - v1.4+ compliant)
      const hashedUserData = {
        email: userData.email ? hashSHA256(userData.email) : undefined,
        phone: userData.phone ? hashSHA256(userData.phone) : undefined,
        external_id: userData.externalId ? hashSHA256(userData.externalId) : undefined,
        ip_address: userData.ipAddress,
        user_agent: userData.userAgent,
        ttclid: userData.ttclid || extractTikTokClickId(options.headers || {}, options.url || '')
      }

      // Remove undefined values
      Object.keys(hashedUserData).forEach(key => {
        if (hashedUserData[key] === undefined) {
          delete hashedUserData[key]
        }
      })

      // Prepare event payload with privacy parameters
      const eventPayload = {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: finalEventId,
        user_data: hashedUserData,
        properties: {
          ...eventData,
          ...(options.utmData && {
            utm_source: options.utmData.utm_source,
            utm_medium: options.utmData.utm_medium,
            utm_campaign: options.utmData.utm_campaign,
            utm_term: options.utmData.utm_term,
            utm_content: options.utmData.utm_content
          })
        }
      }

      // Add LDU (Limited Data Use) flag for privacy compliance
      if (enableLDU && (regionData.isEU || regionData.isCalifornia)) {
        eventPayload.limited_data_use = true
      }

      const payload = {
        pixel_code: config.pixelId,
        events: [eventPayload]
      }

      if (testEventCode) {
        payload.test_event_code = testEventCode
      }

      // Send to TikTok Events API
      const response = await axios.post(
        `https://business-api.tiktok.com/open_api/${apiVersion}/pixel/track/`,
        payload,
        {
          headers: {
            'Access-Token': config.accessToken,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      )

      return { success: true, eventId: finalEventId, data: response.data }
    } catch (error) {
      retryCount++
      if (retryCount >= MAX_RETRIES) {
        return { success: false, message: error.message }
      }
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000))
    }
  }
}

/**
 * Helper function for ViewContent event - v1.4+ compliant with variant matching
 * @param {string} contentId - Product SKU (variant specific)
 * @param {string} itemGroupId - Parent Product ID
 * @param {string} contentName - Product name
 * @param {number} price - Product price
 * @param {string} currency - Currency code
 * @param {object} userData - User data
 * @param {string} eventId - Event ID (optional)
 * @param {object} customData - Custom parameters (content_category, quantity, etc.)
 */
export async function trackTikTokViewContent(contentId, itemGroupId, contentName, price, currency = 'BDT', userData = {}, eventId = null, customData = {}) {
  const eventData = {
    content_id: [contentId],
    item_group_id: itemGroupId,
    content_name: contentName,
    content_type: customData.content_type || 'product',
    content_category: customData.content_category,
    value: price,
    currency: currency,
    quantity: customData.quantity,
    description: customData.description
  }

  return sendTikTokEvent('ViewContent', eventData, userData, eventId)
}

/**
 * Helper function for AddToCart event - v1.4+ compliant with variant matching
 * @param {string} contentId - Product SKU (variant specific)
 * @param {string} itemGroupId - Parent Product ID
 * @param {string} contentName - Product name
 * @param {number} price - Product price
 * @param {number} quantity - Quantity
 * @param {string} currency - Currency code
 * @param {object} userData - User data
 * @param {string} eventId - Event ID (optional)
 * @param {object} customData - Custom parameters (content_category, description)
 */
export async function trackTikTokAddToCart(contentId, itemGroupId, contentName, price, quantity = 1, currency = 'BDT', userData = {}, eventId = null, customData = {}) {
  const eventData = {
    content_id: [contentId],
    item_group_id: itemGroupId,
    content_name: contentName,
    content_type: customData.content_type || 'product',
    content_category: customData.content_category,
    value: price * quantity,
    currency: currency,
    quantity: quantity,
    description: customData.description
  }

  return sendTikTokEvent('AddToCart', eventData, userData, eventId)
}

/**
 * Helper function for InitiateCheckout event
 * @param {number} value - Total value
 * @param {string} currency - Currency code
 * @param {number} numItems - Number of items
 * @param {object} userData - User data
 * @param {string} eventId - Event ID (optional)
 * @param {array} contentIds - Product IDs for dynamic retargeting
 */
export async function trackTikTokInitiateCheckout(value, currency = 'BDT', numItems = 0, userData = {}, eventId = null, contentIds = []) {
  const eventData = {
    value: value,
    currency: currency,
    num_items: numItems,
    content_id: contentIds.length > 0 ? contentIds : undefined,
    content_type: contentIds.length > 0 ? 'product_group' : undefined
  }

  return sendTikTokEvent('InitiateCheckout', eventData, userData, eventId)
}

/**
 * Helper function for Purchase event
 * @param {string} orderId - Order ID
 * @param {number} value - Total value
 * @param {string} currency - Currency code
 * @param {array} contentIds - Product IDs
 * @param {object} userData - User data
 * @param {string} eventId - Event ID (optional)
 * @param {object} customData - Custom parameters (num_items, content_type, etc.)
 */
export async function trackTikTokPurchase(orderId, value, currency = 'BDT', contentIds = [], userData = {}, eventId = null, customData = {}) {
  const eventData = {
    content_id: contentIds,
    transaction_id: orderId,
    value: value,
    currency: currency,
    num_items: customData.num_items,
    content_type: customData.content_type || 'product_group'
  }

  return sendTikTokEvent('Purchase', eventData, userData, eventId)
}

/**
 * Helper function for Search event
 * @param {string} searchString - Search query
 * @param {object} userData - User data
 * @param {string} eventId - Event ID (optional)
 */
export async function trackTikTokSearch(searchString, userData = {}, eventId = null) {
  const eventData = {
    search_string: searchString
  }

  return sendTikTokEvent('Search', eventData, userData, eventId)
}

/**
 * Helper function for CompleteRegistration event
 * @param {object} userData - User data
 * @param {string} eventId - Event ID (optional)
 */
export async function trackTikTokCompleteRegistration(userData = {}, eventId = null) {
  return sendTikTokEvent('CompleteRegistration', {}, userData, eventId)
}
