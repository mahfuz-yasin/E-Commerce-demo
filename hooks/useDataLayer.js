import { useEffect } from 'react'

/**
 * Custom hook for Google Tag Manager DataLayer
 * @returns {Object} DataLayer methods
 */
export const useDataLayer = () => {
  /**
   * Initialize DataLayer
   */
  const initDataLayer = () => {
    if (typeof window !== 'undefined') {
      window.dataLayer = window.dataLayer || []
    }
  }

  /**
   * Push event to DataLayer
   * @param {string} eventName - Event name
   * @param {Object} eventData - Event data
   */
  const pushEvent = (eventName, eventData = {}) => {
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: eventName,
        ...eventData
      })
    }
  }

  /**
   * Push page view event
   * @param {string} pagePath - Page path
   * @param {string} pageTitle - Page title
   */
  const pushPageView = (pagePath, pageTitle) => {
    pushEvent('page_view', {
      page_path: pagePath,
      page_title: pageTitle,
      page_location: window.location.href
    })
  }

  /**
   * Push ecommerce event
   * @param {string} eventName - Event name (view_item, add_to_cart, purchase, etc.)
   * @param {Object} ecommerceData - Ecommerce data
   */
  const pushEcommerceEvent = (eventName, ecommerceData) => {
    pushEvent(eventName, {
      ecommerce: ecommerceData
    })
  }

  /**
   * Push user data event
   * @param {Object} userData - User data (userId, email, phone, etc.)
   */
  const pushUserData = (userData) => {
    pushEvent('user_data', userData)
  }

  /**
   * Push custom event
   * @param {string} eventName - Custom event name
   * @param {Object} eventData - Custom event data
   */
  const pushCustomEvent = (eventName, eventData) => {
    pushEvent(eventName, eventData)
  }

  /**
   * Clear ecommerce object
   */
  const clearEcommerce = () => {
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({ ecommerce: null })
    }
  }

  // Initialize DataLayer on mount
  useEffect(() => {
    initDataLayer()
  }, [])

  return {
    pushEvent,
    pushPageView,
    pushEcommerceEvent,
    pushUserData,
    pushCustomEvent,
    clearEcommerce
  }
}
