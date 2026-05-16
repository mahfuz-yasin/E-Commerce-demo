'use client'
import { useEffect, useState } from 'react'
import Script from 'next/script'
import axios from 'axios'

const GA4 = ({ userId = null, debugMode = false }) => {
  const [measurementId, setMeasurementId] = useState(null)
  const [isConfigured, setIsConfigured] = useState(false)

  useEffect(() => {
    fetchGA4Config()
  }, [])

  const fetchGA4Config = async () => {
    try {
      const response = await axios.get('/api/admin/google-settings')
      if (response.data.success && response.data.data.ga4MeasurementId && response.data.data.isGA4Active === 'active') {
        setMeasurementId(response.data.data.ga4MeasurementId)
        setIsConfigured(true)
      }
    } catch (error) {
      console.error('Failed to fetch GA4 config:', error)
    }
  }

  if (!isConfigured || !measurementId) {
    return null
  }

  return (
    <>
      {/* GA4 Initialization Script */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-config" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}', {
            ${userId ? `user_id: '${userId}',` : ''}
            ${debugMode ? 'debug_mode: true,' : ''}
            send_page_view: true
          });
        `}
      </Script>
    </>
  )
}

export default GA4
