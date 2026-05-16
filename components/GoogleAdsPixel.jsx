'use client'
import { useEffect, useState } from 'react'
import Script from 'next/script'
import axios from 'axios'

const GoogleAdsPixel = ({ conversionId, conversionLabel, gclid, conversionValue = 0, currency = 'BDT' }) => {
  const [isConfigured, setIsConfigured] = useState(false)
  const [configConversionId, setConfigConversionId] = useState(null)
  const [configConversionLabel, setConfigConversionLabel] = useState(null)

  useEffect(() => {
    fetchGoogleAdsConfig()
  }, [])

  const fetchGoogleAdsConfig = async () => {
    try {
      const response = await axios.get('/api/admin/google-settings')
      if (response.data.success && response.data.data.isGoogleAdsActive === 'active') {
        setConfigConversionId(response.data.data.googleAdsConversions?.purchase || null)
        setConfigConversionLabel(response.data.data.googleAdsConversions?.purchase || null)
        setIsConfigured(true)
      }
    } catch (error) {
      console.error('Failed to fetch Google Ads config:', error)
    }
  }

  const finalConversionId = conversionId || configConversionId
  const finalConversionLabel = conversionLabel || configConversionLabel

  if (!isConfigured || !finalConversionId) {
    return null
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=AW-${finalConversionId}`}
        strategy="afterInteractive"
      />
      <Script id="google-ads-config" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'AW-${finalConversionId}');
        `}
      </Script>
      {finalConversionLabel && (
        <Script id="google-ads-conversion" strategy="afterInteractive">
          {`
            gtag('event', 'conversion', {
              'send_to': 'AW-${finalConversionId}/${finalConversionLabel}',
              'value': ${conversionValue},
              'currency': '${currency}',
              'transaction_id': '${gclid || ''}'
            });
          `}
        </Script>
      )}
    </>
  )
}

export default GoogleAdsPixel
