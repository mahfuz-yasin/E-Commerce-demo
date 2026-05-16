'use client'

import { useEffect } from 'react'

/**
 * TikTok Pixel Client Component
 * Initializes TikTok Pixel and tracks standard events
 */
const TikTokPixel = ({ productData }) => {
  useEffect(() => {
    const initializeTikTokPixel = async () => {
      try {
        // Fetch pixel ID from server
        const response = await fetch('/api/tiktok/pixel-config')
        const data = await response.json()

        if (data.success && data.pixelId) {
          // Initialize TikTok Pixel
          window.ttq = window.ttq || []
          window.ttq.load(data.pixelId)
          window.ttq.page()

          console.log('TikTok Pixel initialized with ID:', data.pixelId)
        }
      } catch (error) {
        console.error('Failed to initialize TikTok Pixel:', error)
      }
    }

    initializeTikTokPixel()
  }, [])

  return null
}

export default TikTokPixel

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
 * Track TikTok event from client-side
 * @param {string} eventName - Event name (ViewContent, AddToCart, etc.)
 * @param {object} eventData - Event data
 * @param {string} eventId - Unique event ID for deduplication
 */
export function trackTikTokEvent(eventName, eventData = {}, eventId = null) {
  if (!window.ttq) {
    console.warn('TikTok Pixel not initialized')
    return
  }

  const finalEventId = eventId || generateTikTokEventId()

  window.ttq.track(eventName, {
    ...eventData,
    event_id: finalEventId
  })

  return finalEventId
}

/**
 * Track PageView event
 */
export function trackTikTokPageView() {
  if (!window.ttq) return
  window.ttq.page()
}

/**
 * Track ViewContent event
 * @param {string} contentId - Product ID
 * @param {string} contentType - Content type (product/product_group)
 * @param {string} contentName - Product name
 * @param {number} value - Product value
 * @param {string} currency - Currency code
 * @param {string} eventId - Event ID (optional)
 * @param {object} customData - Custom parameters (content_category, quantity, description)
 */
export function trackTikTokViewContent(contentId, contentType = 'product', contentName, value, currency = 'BDT', eventId = null, customData = {}) {
  return trackTikTokEvent('ViewContent', {
    content_id: contentId,
    content_type: contentType,
    content_name: contentName,
    content_category: customData.content_category,
    value: value,
    currency: currency,
    quantity: customData.quantity,
    description: customData.description
  }, eventId)
}

/**
 * Track AddToCart event
 * @param {string} contentId - Product ID
 * @param {string} contentType - Content type (product/product_group)
 * @param {string} contentName - Product name
 * @param {number} value - Product value
 * @param {number} quantity - Quantity
 * @param {string} currency - Currency code
 * @param {string} eventId - Event ID (optional)
 * @param {object} customData - Custom parameters (content_category, description)
 */
export function trackTikTokAddToCart(contentId, contentType = 'product', contentName, value, quantity = 1, currency = 'BDT', eventId = null, customData = {}) {
  return trackTikTokEvent('AddToCart', {
    content_id: contentId,
    content_type: contentType,
    content_name: contentName,
    content_category: customData.content_category,
    value: value * quantity,
    currency: currency,
    quantity: quantity,
    description: customData.description
  }, eventId)
}

/**
 * Track InitiateCheckout event
 * @param {number} value - Total value
 * @param {string} currency - Currency code
 * @param {number} numItems - Number of items
 * @param {string} eventId - Event ID (optional)
 * @param {array} contentIds - Product IDs for dynamic retargeting
 */
export function trackTikTokInitiateCheckout(value, currency = 'BDT', numItems = 0, eventId = null, contentIds = []) {
  return trackTikTokEvent('InitiateCheckout', {
    value: value,
    currency: currency,
    num_items: numItems,
    content_id: contentIds.length > 0 ? contentIds : undefined,
    content_type: contentIds.length > 0 ? 'product_group' : undefined
  }, eventId)
}

/**
 * Track Purchase event
 * @param {string} orderId - Order ID
 * @param {number} value - Total value
 * @param {string} currency - Currency code
 * @param {array} contentIds - Product IDs
 * @param {string} eventId - Event ID (optional)
 * @param {object} customData - Custom parameters (num_items, content_type)
 */
export function trackTikTokPurchase(orderId, value, currency = 'BDT', contentIds = [], eventId = null, customData = {}) {
  return trackTikTokEvent('Purchase', {
    content_id: contentIds,
    transaction_id: orderId,
    value: value,
    currency: currency,
    num_items: customData.num_items,
    content_type: customData.content_type || 'product_group'
  }, eventId)
}

/**
 * Track Search event
 * @param {string} searchString - Search query
 * @param {string} eventId - Event ID (optional)
 */
export function trackTikTokSearch(searchString, eventId = null) {
  return trackTikTokEvent('Search', {
    search_string: searchString
  }, eventId)
}

/**
 * Track CompleteRegistration event
 * @param {string} eventId - Event ID (optional)
 */
export function trackTikTokCompleteRegistration(eventId = null) {
  return trackTikTokEvent('CompleteRegistration', {}, eventId)
}
