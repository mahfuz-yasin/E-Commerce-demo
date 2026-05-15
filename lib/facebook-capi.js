import crypto from 'crypto'
import axios from 'axios'
import FacebookConfigModel from '@/models/FacebookConfig.model'
import { connectDB } from '@/lib/databaseConnection'

// Event queue for batch processing
let eventQueue = []
let batchTimeout = null
const BATCH_DELAY = 5000 // 5 seconds
const MAX_RETRIES = 3

/**
 * Hash data using SHA256 (required by Facebook CAPI)
 * @param {string} data - Data to hash
 * @returns {string} SHA256 hash
 */
function hashSHA256(data) {
  if (!data) return ''
  return crypto.createHash('sha256').update(normalizeData(data)).digest('hex')
}

/**
 * Normalize data before hashing (lowercase, trim)
 * @param {string} data - Data to normalize
 * @returns {string} Normalized data
 */
function normalizeData(data) {
  return data.toString().toLowerCase().trim()
}

/**
 * Generate UUID v4 for event deduplication
 * @returns {string} UUID
 */
function generateEventId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * Process event queue and send batch to Facebook (supports Direct API and CAPI Gateway)
 */
async function processBatch() {
  if (eventQueue.length === 0) return

  const batch = [...eventQueue]
  eventQueue = []

  try {
    const config = await FacebookConfigModel.getConfig()
    
    if (!config.pixelId || !config.capiAccessToken || config.capiStatus !== 'active') {
      console.warn('CAPI not configured or inactive')
      return
    }

    const apiVersion = config.apiVersion || 'v21.0'
    const testEventCode = config.testEventCode
    const capiMethod = config.capiMethod || 'DIRECT_GRAPH_API'

    const events = batch.map(item => ({
      event_name: item.eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_id: item.eventId,
      event_source_url: item.eventSourceUrl || process.env.NEXT_PUBLIC_BASE_URL || 'https://alhilalpanjabi.com',
      action_source: item.actionSource || 'website',
      user_data: item.userData,
      custom_data: item.customData
    }))

    const payload = {
      data: events
    }

    if (testEventCode) {
      payload.test_event_code = testEventCode
    }

    let response
    if (capiMethod === 'CAPI_GATEWAY' && config.capiGatewayUrl) {
      // Send to CAPI Gateway (AWS/Stape.io)
      payload.access_token = config.capiAccessToken
      response = await axios.post(config.capiGatewayUrl, payload, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      })
    } else {
      // Send directly to Facebook Graph API
      payload.access_token = config.capiAccessToken
      response = await axios.post(
        `https://graph.facebook.com/${apiVersion}/${config.pixelId}/events`,
        payload
      )
    }

    console.log('CAPI batch sent successfully:', response.data)
    return response.data
  } catch (error) {
    console.error('CAPI batch failed:', error.response?.data || error.message)
    
    // Re-queue failed events
    eventQueue = [...batch, ...eventQueue]
    throw error
  }
}

/**
 * Send event to Facebook CAPI with retry logic
 * @param {string} eventName - Event name (ViewContent, AddToCart, etc.)
 * @param {object} customData - Custom event data
 * @param {object} userData - User data (email, phone, etc.)
 * @param {string} eventId - Unique event ID for deduplication
 * @param {object} options - Additional options (eventSourceUrl, actionSource)
 * @returns {Promise} Response from Facebook
 */
export async function sendFacebookEvent(eventName, customData = {}, userData = {}, eventId = null, options = {}) {
  try {
    const config = await FacebookConfigModel.getConfig()
    
    if (!config.pixelId || !config.capiAccessToken || config.capiStatus !== 'active') {
      console.warn('CAPI not configured or inactive')
      return { success: false, message: 'CAPI not configured or inactive' }
    }

    // Generate event ID if not provided
    const finalEventId = eventId || generateEventId()

    // Hash user data
    const hashedUserData = {
      em: userData.email ? hashSHA256(userData.email) : undefined,
      ph: userData.phone ? hashSHA256(userData.phone) : undefined,
      fn: userData.firstName ? hashSHA256(userData.firstName) : undefined,
      ln: userData.lastName ? hashSHA256(userData.lastName) : undefined,
      ge: userData.gender ? hashSHA256(userData.gender) : undefined,
      db: userData.dateOfBirth ? hashSHA256(userData.dateOfBirth) : undefined,
      ct: userData.city ? hashSHA256(userData.city) : undefined,
      st: userData.state ? hashSHA256(userData.state) : undefined,
      zp: userData.zipCode ? hashSHA256(userData.zipCode) : undefined,
      country: userData.country ? hashSHA256(userData.country) : undefined,
      external_id: userData.externalId ? hashSHA256(userData.externalId) : undefined,
      client_ip_address: userData.ipAddress,
      client_user_agent: userData.userAgent
    }

    // Remove undefined values
    Object.keys(hashedUserData).forEach(key => {
      if (hashedUserData[key] === undefined) {
        delete hashedUserData[key]
      }
    })

    // Add to batch queue
    eventQueue.push({
      eventName,
      eventId: finalEventId,
      userData: hashedUserData,
      customData,
      eventSourceUrl: options.eventSourceUrl,
      actionSource: options.actionSource
    })

    // Clear existing timeout and set new one
    if (batchTimeout) {
      clearTimeout(batchTimeout)
    }

    batchTimeout = setTimeout(processBatch, BATCH_DELAY)

    return { success: true, eventId: finalEventId, message: 'Event queued for batch processing' }
  } catch (error) {
    console.error('Error sending Facebook event:', error)
    return { success: false, message: error.message }
  }
}

/**
 * Send event immediately (without batching) with retry logic (supports Direct API and CAPI Gateway)
 * @param {string} eventName - Event name
 * @param {object} customData - Custom event data
 * @param {object} userData - User data
 * @param {string} eventId - Event ID
 * @param {object} options - Additional options
 * @returns {Promise} Response
 */
export async function sendFacebookEventImmediate(eventName, customData = {}, userData = {}, eventId = null, options = {}) {
  let retryCount = 0

  while (retryCount < MAX_RETRIES) {
    try {
      const config = await FacebookConfigModel.getConfig()
      
      if (!config.pixelId || !config.capiAccessToken || config.capiStatus !== 'active') {
        console.warn('CAPI not configured or inactive')
        return { success: false, message: 'CAPI not configured or inactive' }
      }

      const finalEventId = eventId || generateEventId()
      const apiVersion = config.apiVersion || 'v21.0'
      const testEventCode = config.testEventCode
      const capiMethod = config.capiMethod || 'DIRECT_GRAPH_API'

      // Hash user data
      const hashedUserData = {
        em: userData.email ? hashSHA256(userData.email) : undefined,
        ph: userData.phone ? hashSHA256(userData.phone) : undefined,
        fn: userData.firstName ? hashSHA256(userData.firstName) : undefined,
        ln: userData.lastName ? hashSHA256(userData.lastName) : undefined,
        ge: userData.gender ? hashSHA256(userData.gender) : undefined,
        db: userData.dateOfBirth ? hashSHA256(userData.dateOfBirth) : undefined,
        ct: userData.city ? hashSHA256(userData.city) : undefined,
        st: userData.state ? hashSHA256(userData.state) : undefined,
        zp: userData.zipCode ? hashSHA256(userData.zipCode) : undefined,
        country: userData.country ? hashSHA256(userData.country) : undefined,
        external_id: userData.externalId ? hashSHA256(userData.externalId) : undefined,
        client_ip_address: userData.ipAddress,
        client_user_agent: userData.userAgent
      }

      // Remove undefined values
      Object.keys(hashedUserData).forEach(key => {
        if (hashedUserData[key] === undefined) {
          delete hashedUserData[key]
        }
      })

      const eventPayload = {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: finalEventId,
        event_source_url: options.eventSourceUrl || process.env.NEXT_PUBLIC_BASE_URL || 'https://alhilalpanjabi.com',
        action_source: options.actionSource || 'website',
        user_data: hashedUserData,
        custom_data: {
          ...customData,
          ...(options.utmData && {
            utm_source: options.utmData.utm_source,
            utm_medium: options.utmData.utm_medium,
            utm_campaign: options.utmData.utm_campaign,
            utm_term: options.utmData.utm_term,
            utm_content: options.utmData.utm_content,
            fbclid: options.utmData.fbclid
          })
        }
      }

      // Add variant tracking if enabled
      if (config.variantTracking && options.variantData) {
        eventPayload.custom_data.item_group_id = options.variantData.itemGroupId
        eventPayload.customData.content_ids = [options.variantData.sku]
      }

      const payload = {
        data: [eventPayload]
      }

      if (testEventCode) {
        payload.test_event_code = testEventCode
      }

      let response
      if (capiMethod === 'CAPI_GATEWAY' && config.capiGatewayUrl) {
        // Send to CAPI Gateway (AWS/Stape.io)
        payload.access_token = config.capiAccessToken
        response = await axios.post(config.capiGatewayUrl, payload, {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 10000
        })
      } else {
        // Send directly to Facebook Graph API
        payload.access_token = config.capiAccessToken
        response = await axios.post(
          `https://graph.facebook.com/${apiVersion}/${config.pixelId}/events`,
          payload
        )
      }

      console.log('CAPI event sent successfully:', response.data)
      return { success: true, eventId: finalEventId, data: response.data }
    } catch (error) {
      retryCount++
      if (retryCount >= MAX_RETRIES) {
        console.error('CAPI event failed after retries:', error.response?.data || error.message)
        return { success: false, message: error.message }
      }
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000))
    }
  }
}

/**
 * Helper function for ViewContent event
 * @param {string} productId - Product ID
 * @param {string} productName - Product name
 * @param {number} price - Product price
 * @param {string} currency - Currency code
 * @param {object} userData - User data
 * @param {string} eventId - Event ID (optional)
 */
export async function trackViewContent(productId, productName, price, currency = 'BDT', userData = {}, eventId = null) {
  const customData = {
    content_ids: [productId],
    content_name: productName,
    content_type: 'product',
    value: price,
    currency: currency
  }

  return sendFacebookEvent('ViewContent', customData, userData, eventId)
}

/**
 * Helper function for AddToCart event
 * @param {string} productId - Product ID
 * @param {string} productName - Product name
 * @param {number} price - Product price
 * @param {number} quantity - Quantity
 * @param {string} currency - Currency code
 * @param {object} userData - User data
 * @param {string} eventId - Event ID (optional)
 */
export async function trackAddToCart(productId, productName, price, quantity = 1, currency = 'BDT', userData = {}, eventId = null) {
  const customData = {
    content_ids: [productId],
    content_name: productName,
    content_type: 'product',
    value: price * quantity,
    currency: currency,
    num_items: quantity
  }

  return sendFacebookEvent('AddToCart', customData, userData, eventId)
}

/**
 * Helper function for InitiateCheckout event
 * @param {number} value - Total value
 * @param {string} currency - Currency code
 * @param {number} numItems - Number of items
 * @param {object} userData - User data
 * @param {string} eventId - Event ID (optional)
 */
export async function trackInitiateCheckout(value, currency = 'BDT', numItems = 0, userData = {}, eventId = null) {
  const customData = {
    value: value,
    currency: currency,
    num_items: numItems
  }

  return sendFacebookEvent('InitiateCheckout', customData, userData, eventId)
}

/**
 * Helper function for Purchase event
 * @param {string} orderId - Order ID
 * @param {number} value - Total value
 * @param {string} currency - Currency code
 * @param {array} contentIds - Product IDs
 * @param {object} userData - User data
 * @param {string} eventId - Event ID (optional)
 */
export async function trackPurchase(orderId, value, currency = 'BDT', contentIds = [], userData = {}, eventId = null) {
  const customData = {
    content_ids: contentIds,
    transaction_id: orderId,
    value: value,
    currency: currency
  }

  // Send immediately for purchase event
  return sendFacebookEventImmediate('Purchase', customData, userData, eventId)
}
