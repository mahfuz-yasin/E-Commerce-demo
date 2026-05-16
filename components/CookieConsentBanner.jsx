'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, Cookie } from 'lucide-react'

const CookieConsentBanner = () => {
  const [showBanner, setShowBanner] = useState(false)
  const [consent, setConsent] = useState(null)

  useEffect(() => {
    // Check if user has already made a consent decision
    const savedConsent = localStorage.getItem('cookie_consent')
    if (!savedConsent) {
      setShowBanner(true)
    } else {
      setConsent(JSON.parse(savedConsent))
      // Update Google Consent Mode based on saved preference
      updateGoogleConsent(JSON.parse(savedConsent))
    }
  }, [])

  const updateGoogleConsent = (consentData) => {
    if (typeof window !== 'undefined && window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': consentData.analytics ? 'granted' : 'denied',
        'ad_storage': consentData.advertising ? 'granted' : 'denied',
        'ad_user_data': consentData.advertising ? 'granted' : 'denied',
        'ad_personalization': consentData.advertising ? 'granted' : 'denied'
      })
    }
  }

  const handleAcceptAll = () => {
    const consentData = {
      analytics: true,
      advertising: true,
      timestamp: new Date().toISOString()
    }
    localStorage.setItem('cookie_consent', JSON.stringify(consentData))
    setConsent(consentData)
    updateGoogleConsent(consentData)
    setShowBanner(false)
  }

  const handleAcceptEssential = () => {
    const consentData = {
      analytics: false,
      advertising: false,
      timestamp: new Date().toISOString()
    }
    localStorage.setItem('cookie_consent', JSON.stringify(consentData))
    setConsent(consentData)
    updateGoogleConsent(consentData)
    setShowBanner(false)
  }

  const handleCustomize = () => {
    // Open a modal for custom consent options
    // For now, default to accept all
    handleAcceptAll()
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 shadow-lg z-50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <Cookie className="h-6 w-6 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium mb-1">Cookie Preferences</p>
            <p className="text-sm text-gray-300">
              We use cookies to improve your experience and for marketing purposes. 
              You can accept all cookies or only essential ones.
            </p>
          </div>
        </div>
        
        <div className="flex gap-2 flex-shrink-0">
          <Button
            onClick={handleAcceptEssential}
            variant="outline"
            className="bg-transparent border-white text-white hover:bg-white/10 cursor-pointer"
          >
            Essential Only
          </Button>
          <Button
            onClick={handleAcceptAll}
            className="bg-white text-gray-900 hover:bg-gray-100 cursor-pointer"
          >
            Accept All
          </Button>
          <Button
            onClick={() => setShowBanner(false)}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CookieConsentBanner
