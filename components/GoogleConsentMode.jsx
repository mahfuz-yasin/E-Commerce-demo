'use client'
import { useEffect } from 'react'
import Script from 'next/script'

const GoogleConsentMode = ({ defaultDenied = true }) => {
  useEffect(() => {
    // Initialize default consent
    const defaultConsent = defaultDenied ? 'denied' : 'granted'
    
    window.dataLayer = window.dataLayer || []
    
    function gtag() {
      window.dataLayer.push(arguments)
    }
    
    // Set default consent state
    gtag('consent', 'default', {
      'analytics_storage': defaultConsent,
      'ad_storage': defaultConsent,
      'ad_user_data': defaultConsent,
      'ad_personalization': defaultConsent,
      'functionality_storage': 'granted',
      'security_storage': 'granted'
    })
    
    // Check for user consent from cookies
    const userConsent = localStorage.getItem('google_consent')
    if (userConsent) {
      const consentSettings = JSON.parse(userConsent)
      
      gtag('consent', 'update', {
        'analytics_storage': consentSettings.analytics ? 'granted' : 'denied',
        'ad_storage': consentSettings.advertising ? 'granted' : 'denied',
        'ad_user_data': consentSettings.advertising ? 'granted' : 'denied',
        'ad_personalization': consentSettings.advertising ? 'granted' : 'denied'
      })
    }
  }, [defaultDenied])

  return null
}

export default GoogleConsentMode
