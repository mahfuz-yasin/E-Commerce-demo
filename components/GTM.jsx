'use client'
import { useEffect, useState } from 'react'
import Script from 'next/script'
import axios from 'axios'

const GTM = () => {
  const [gtmConfig, setGtmConfig] = useState(null)
  const [isProduction, setIsProduction] = useState(false)

  useEffect(() => {
    setIsProduction(process.env.NODE_ENV === 'production')
    
    // Only fetch GTM config in production
    if (isProduction) {
      fetchGTMConfig()
    }
  }, [isProduction])

  const fetchGTMConfig = async () => {
    try {
      const { data } = await axios.get('/api/google/gtm/config')
      if (data.success) {
        setGtmConfig(data.data)
      }
    } catch (error) {
      console.error('Error fetching GTM config:', error)
    }
  }

  if (!gtmConfig || !gtmConfig.gtmContainerId || !isProduction) {
    return null
  }

  const gtmContainerId = gtmConfig.gtmContainerId || ''
  const gtmAuth = gtmConfig.gtmAuth || ''
  const gtmPreview = gtmConfig.gtmPreview || ''

  // Initialize dataLayer
  useEffect(() => {
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({
      'gtm.start': new Date().getTime(),
      event: 'gtm.js'
    })
  }, [])

  return (
    <>
      {/* GTM Head Script */}
      <Script
        src={`https://www.googletagmanager.com/gtm.js?id=${gtmContainerId}${gtmAuth ? `&gtm_auth=${gtmAuth}` : ''}${gtmPreview ? `&gtm_preview=${gtmPreview}` : ''}`}
        strategy="afterInteractive"
      />

      {/* GTM NoScript */}
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${gtmContainerId}`}
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
        />
      </noscript>
    </>
  )
}

export default GTM
