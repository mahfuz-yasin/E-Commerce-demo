import { useEffect, useState } from 'react'

export default function useFacebookUTM() {
  const [utmData, setUtmData] = useState({})

  useEffect(() => {
    // Get UTM parameters from cookies
    const utmParams = {
      utm_source: getCookie('utm_source'),
      utm_medium: getCookie('utm_medium'),
      utm_campaign: getCookie('utm_campaign'),
      utm_term: getCookie('utm_term'),
      utm_content: getCookie('utm_content'),
      fbclid: getCookie('fbclid')
    }

    // Also check URL parameters on initial load
    const urlParams = new URLSearchParams(window.location.search)
    Object.keys(utmParams).forEach(key => {
      if (urlParams.get(key)) {
        utmParams[key] = urlParams.get(key)
      }
    })

    setUtmData(utmParams)
  }, [])

  return utmData
}

function getCookie(name) {
  if (typeof document === 'undefined') return null
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
  return null
}
