'use client'
import { useState, useEffect } from 'react'
import { X, Gift } from 'lucide-react'
import useFacebookUTM from '@/hooks/useFacebookUTM'

export default function FacebookPromotionBanner() {
  const utmData = useFacebookUTM()
  const [promotion, setPromotion] = useState(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if user came from Facebook
    const isFromFacebook = utmData.utm_source === 'facebook' || utmData.fbclid
    
    if (!isFromFacebook) {
      return
    }

    // Check if offer cookie exists (user already saw the offer)
    const offerCookie = getCookie('fb_promotion_shown')
    if (offerCookie) {
      return
    }

    // Fetch promotion settings from API
    fetchPromotionSettings()
  }, [utmData])

  const fetchPromotionSettings = async () => {
    try {
      const response = await fetch('/api/admin/facebook-settings')
      const data = await response.json()
      
      if (data.success && data.data.promotionStatus === 'active') {
        setPromotion(data.data)
        setIsVisible(true)
      }
    } catch (error) {
      console.error('Error fetching promotion settings:', error)
    }
  }

  const handleDismiss = () => {
    // Set cookie to prevent showing again
    const expirationDays = promotion?.promotionCookieExpiration || 7
    document.cookie = `fb_promotion_shown=true; max-age=${expirationDays * 24 * 60 * 60}; path=/`
    setIsVisible(false)
  }

  const handleCopyCode = () => {
    if (promotion?.promotionDiscountCode) {
      navigator.clipboard.writeText(promotion.promotionDiscountCode)
    }
  }

  if (!isVisible || !promotion) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg shadow-2xl p-6 relative">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-white/70 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className="bg-white/20 rounded-full p-3">
            <Gift className="h-6 w-6" />
          </div>

          <div className="flex-1">
            <h3 className="font-bold text-lg mb-2">
              {promotion.promotionBannerText || 'Special Facebook Offer!'}
            </h3>
            
            <div className="bg-white/20 rounded-lg p-3 mb-3">
              <p className="text-sm opacity-90 mb-1">
                Use code at checkout:
              </p>
              <div className="flex items-center justify-between">
                <code className="text-2xl font-bold tracking-wider">
                  {promotion.promotionDiscountCode || 'FB10OFF'}
                </code>
                <button
                  onClick={handleCopyCode}
                  className="text-xs bg-white text-blue-600 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                >
                  Copy
                </button>
              </div>
            </div>

            <p className="text-sm opacity-90">
              Get {promotion.promotionDiscountPercentage || 10}% off your first order!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function getCookie(name) {
  if (typeof document === 'undefined') return null
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
  return null
}
