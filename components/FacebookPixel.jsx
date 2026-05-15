'use client'
import { useEffect, useState } from 'react'
import Script from 'next/script'
import useFetch from '@/hooks/useFetch'

// Generate UUID v4
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// Store event_id in localStorage for deduplication
function storeEventId(eventId) {
  try {
    const events = JSON.parse(localStorage.getItem('fb_events') || '[]')
    const eventWithTimestamp = {
      id: eventId,
      timestamp: Date.now()
    }
    events.push(eventWithTimestamp)
    localStorage.setItem('fb_events', JSON.stringify(events))
  } catch (error) {
    console.error('Error storing event ID:', error)
  }
}

// Clean up old events (older than 24 hours)
function cleanupOldEvents() {
  try {
    const events = JSON.parse(localStorage.getItem('fb_events') || '[]')
    const now = Date.now()
    const twentyFourHours = 24 * 60 * 60 * 1000
    const filteredEvents = events.filter(event => now - event.timestamp < twentyFourHours)
    localStorage.setItem('fb_events', JSON.stringify(filteredEvents))
  } catch (error) {
    console.error('Error cleaning up events:', error)
  }
}

// Check if event already sent (for deduplication)
function isEventSent(eventId) {
  try {
    const events = JSON.parse(localStorage.getItem('fb_events') || '[]')
    return events.some(event => event.id === eventId)
  } catch (error) {
    return false
  }
}

const FacebookPixel = () => {
  const { data: settings, error } = useFetch('/api/admin/facebook-settings')
  const [isInitialized, setIsInitialized] = useState(false)
  const pixelId = settings?.data?.pixelId
  const pixelStatus = settings?.data?.pixelStatus

  useEffect(() => {
    cleanupOldEvents()
  }, [])

  useEffect(() => {
    if (pixelId && pixelStatus === 'active' && typeof window !== 'undefined') {
      // Initialize Facebook Pixel
      window.fbq = window.fbq || function() {
        (window.fbq.q = window.fbq.q || []).push(arguments)
      }
      window.fbq('init', pixelId)
      window.fbq('track', 'PageView')
      setIsInitialized(true)
    }
  }, [pixelId, pixelStatus])

  // Track PageView on route change
  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined') {
      window.fbq('track', 'PageView')
    }
  }, [isInitialized])

  if (!pixelId || pixelStatus !== 'active') {
    return null
  }

  return (
    <>
      <Script
        id="facebook-pixel"
        strategy="afterInteractive"
        src={`https://connect.facebook.net/en_US/fbevents.js`}
        onLoad={() => {
          if (typeof window !== 'undefined' && window.fbq) {
            window.fbq('init', pixelId)
            window.fbq('track', 'PageView')
          }
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  )
}

// Export helper functions for tracking events
export const trackFacebookEvent = (eventName, eventData = {}) => {
  if (typeof window === 'undefined' || !window.fbq) {
    return null
  }

  // Generate unique event_id for deduplication
  const eventId = generateUUID()
  storeEventId(eventId)

  // Track event with event_id
  window.fbq('track', eventName, eventData, { eventID: eventId })

  return eventId
}

export const trackCustomEvent = (eventName, eventData = {}) => {
  if (typeof window === 'undefined' || !window.fbq) {
    return null
  }

  const eventId = generateUUID()
  storeEventId(eventId)

  window.fbq('trackCustom', eventName, eventData, { eventID: eventId })

  return eventId
}

export const trackViewContent = (productId, productName, price, currency = 'BDT') => {
  return trackFacebookEvent('ViewContent', {
    content_ids: [productId],
    content_name: productName,
    content_type: 'product',
    value: price,
    currency: currency
  })
}

export const trackAddToCart = (productId, productName, price, quantity = 1, currency = 'BDT') => {
  return trackFacebookEvent('AddToCart', {
    content_ids: [productId],
    content_name: productName,
    content_type: 'product',
    value: price * quantity,
    currency: currency
  })
}

export const trackInitiateCheckout = (value, currency = 'BDT', numItems = 0) => {
  return trackFacebookEvent('InitiateCheckout', {
    value: value,
    currency: currency,
    num_items: numItems
  })
}

export const trackPurchase = (orderId, value, currency = 'BDT', contentIds = []) => {
  return trackFacebookEvent('Purchase', {
    content_ids: contentIds,
    transaction_id: orderId,
    value: value,
    currency: currency
  })
}

export default FacebookPixel
