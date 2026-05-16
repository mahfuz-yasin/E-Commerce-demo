'use client'
import { useEffect, useState } from 'react'
import Script from 'next/script'
import axios from 'axios'

const GTM = ({ previewMode = false }) => {
  const [gtmConfig, setGtmConfig] = useState(null)
  const [isConfigured, setIsConfigured] = useState(false)

  useEffect(() => {
    fetchGTMConfig()
  }, [])

  const fetchGTMConfig = async () => {
    try {
      const { data } = await axios.get('/api/admin/google-settings')
      if (data.success && data.data.isGTMActive === 'active') {
        setGtmConfig(data.data)
        setIsConfigured(true)
      }
    } catch (error) {
      console.error('Failed to fetch GTM config:', error)
    }
  }

  if (!isConfigured || !gtmConfig?.gtmContainerId) {
    return null
  }

  const containerId = gtmConfig.gtmContainerId
  const auth = gtmConfig.gtmAuth || ''
  const preview = gtmConfig.gtmPreview || ''

  // Initialize DataLayer
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || []
  }

  return (
    <>
      {/* GTM Head Script */}
      <Script
        id="gtm-head"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){
              w[l]=w[l]||[];
              w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});
              var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
              j.async=true;
              j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl+'${auth ? '&gtm_auth='+auth : ''}${preview ? '&gtm_preview='+preview+'&gtm_cookies_win=x' : ''}';
              f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${containerId}');
          `
        }}
      />

      {/* GTM NoScript */}
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${containerId}`}
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
        />
      </noscript>
    </>
  )
}

export default GTM
