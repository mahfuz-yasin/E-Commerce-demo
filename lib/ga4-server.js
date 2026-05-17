import { connectDB } from "@/lib/databaseConnection"
import GoogleConfigModel from "@/models/GoogleConfig.model"
import crypto from 'crypto'
import axios from 'axios'

/**
 * Hash data using SHA256 for User-ID
 * @param {string} data - Data to hash
 * @returns {string} SHA256 hash
 */
function hashSHA256(data) {
  if (!data) return ''
  const normalized = data.toString().toLowerCase().trim()
  return crypto.createHash('sha256').update(normalized).digest('hex')
}

/**
 * Generate or retrieve client ID
 * @param {string} existingClientId - Existing client ID (optional)
 * @returns {string} Client ID
 */
function generateClientId(existingClientId = null) {
  if (existingClientId) return existingClientId
  return Date.now().toString() + Math.random().toString(36).substring(2)
}

/**
 * Send event to GA4 Measurement Protocol (Server-side)
 * @param {string} eventName - Event name (view_item, add_to_cart, purchase, etc.)
 * @param {object} eventData - Event data
 * @param {string} clientId - Client ID
 * @param {string} userId - User ID (optional)
 * @param {object} userData - User data (email, phone) for User-ID (optional)
 * @param {boolean} debugMode - Debug mode flag
 * @returns {Promise} Response from GA4
 */
export async function sendGA4Event(eventName, eventData = {}, clientId = null, userId = null, userData = {}, debugMode = false) {
  try {
    // Skip if MONGODB_URI is not set
    if (!process.env.MONGODB_URI) {
      console.warn('MONGODB_URI not set, skipping GA4 event')
      return { success: false, message: 'Database not configured' }
    }
    
    await connectDB()

    let config
    try {
      config = await GoogleConfigModel.getConfig()
    } catch (dbError) {
      console.error('Error fetching Google config:', dbError)
      return { success: false, message: 'Database error' }
    }

    if (!config.ga4MeasurementId || !config.ga4ApiSecret || config.isGA4Active !== 'active') {
      console.warn('GA4 not configured or inactive')
      return { success: false, message: 'GA4 not configured or inactive' }
    }

    const finalClientId = generateClientId(clientId)
    const timestampMicros = Date.now() * 1000

    // Prepare user data for User-ID
    const ga4UserData = {}
    if (userData.email) {
      ga4UserData.sha256_email_address = hashSHA256(userData.email)
    }
    if (userData.phone) {
      ga4UserData.sha256_phone_number = hashSHA256(userData.phone)
    }

    // Prepare event payload
    const eventPayload = {
      name: eventName,
      params: eventData
    }

    const payload = {
      client_id: finalClientId,
      timestamp_micros: timestampMicros,
      non_personalized_ads: false,
      events: [eventPayload]
    }

    if (userId) {
      payload.user_id = userId.toString()
    }

    if (Object.keys(ga4UserData).length > 0) {
      payload.user_properties = {
        ...ga4UserData
      }
    }

    if (debugMode) {
      payload.debug_mode = true
    }

    // Send to GA4 Measurement Protocol
    const measurementId = config.ga4MeasurementId
    const apiSecret = config.ga4ApiSecret
    const url = `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`

    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    })

    return { success: true, clientId: finalClientId, data: response.data }
  } catch (error) {
    console.error('GA4 event send failed:', error)
    return { success: false, message: error.message }
  }
}

/**
 * Enhanced Ecommerce Events
 */

/**
 * Track view_item event
 * @param {object} item - Product item data
 * @param {string} clientId - Client ID
 * @param {string} userId - User ID (optional)
 * @param {object} userData - User data (optional)
 */
export async function trackGA4ViewItem(item, clientId = null, userId = null, userData = {}) {
  const eventData = {
    currency: item.currency || 'BDT',
    value: item.price || item.sellingPrice || 0,
    items: [
      {
        item_id: item._id?.toString() || item.sku || item.id,
        item_name: item.name || item.title,
        item_category: item.category?.name || item.category,
        price: item.price || item.sellingPrice || 0,
        quantity: 1
      }
    ]
  }

  return sendGA4Event('view_item', eventData, clientId, userId, userData)
}

/**
 * Track add_to_cart event
 * @param {object} item - Product item data
 * @param {number} quantity - Quantity
 * @param {string} clientId - Client ID
 * @param {string} userId - User ID (optional)
 * @param {object} userData - User data (optional)
 */
export async function trackGA4AddToCart(item, quantity = 1, clientId = null, userId = null, userData = {}) {
  const eventData = {
    currency: item.currency || 'BDT',
    value: (item.price || item.sellingPrice || 0) * quantity,
    items: [
      {
        item_id: item._id?.toString() || item.sku || item.id,
        item_name: item.name || item.title,
        item_category: item.category?.name || item.category,
        price: item.price || item.sellingPrice || 0,
        quantity: quantity
      }
    ]
  }

  return sendGA4Event('add_to_cart', eventData, clientId, userId, userData)
}

/**
 * Track begin_checkout event
 * @param {array} items - Array of cart items
 * @param {number} totalValue - Total cart value
 * @param {string} clientId - Client ID
 * @param {string} userId - User ID (optional)
 * @param {object} userData - User data (optional)
 */
export async function trackGA4BeginCheckout(items, totalValue, clientId = null, userId = null, userData = {}) {
  const eventData = {
    currency: 'BDT',
    value: totalValue,
    items: items.map(item => ({
      item_id: item.productId?._id?.toString() || item.productId?.sku || item.productId?.id,
      item_name: item.productId?.name || item.productId?.title,
      item_category: item.productId?.category?.name || item.productId?.category,
      price: item.price || item.productId?.sellingPrice || 0,
      quantity: item.quantity
    }))
  }

  return sendGA4Event('begin_checkout', eventData, clientId, userId, userData)
}

/**
 * Track purchase event
 * @param {object} orderData - Order data
 * @param {string} clientId - Client ID
 * @param {string} userId - User ID (optional)
 * @param {object} userData - User data (optional)
 */
export async function trackGA4Purchase(orderData, clientId = null, userId = null, userData = {}) {
  const eventData = {
    transaction_id: orderData.order_id || orderData._id?.toString(),
    affiliation: 'Al Hilal Panjabi',
    currency: 'BDT',
    value: orderData.totalAmount || orderData.value,
    tax: orderData.tax || 0,
    shipping: orderData.shipping || 0,
    coupon: orderData.coupon || orderData.discountCode || '',
    items: orderData.products?.map(item => ({
      item_id: item.productId?._id?.toString() || item.productId?.sku || item.productId?.id,
      item_name: item.productId?.name || item.productId?.title,
      item_category: item.productId?.category?.name || item.productId?.category,
      price: item.mrp || item.sellingPrice || item.price || 0,
      quantity: item.qty || item.quantity
    })) || []
  }

  return sendGA4Event('purchase', eventData, clientId, userId, userData)
}
