'use client'
import { useEffect, useState } from 'react'
import Script from 'next/script'
import useFetch from '@/hooks/useFetch'

export default function MessengerChat() {
  const { data: settings } = useFetch('/api/admin/facebook-settings')
  const [pageId, setPageId] = useState(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (settings?.data?.messengerPageId && settings?.data?.messengerStatus === 'active') {
      setPageId(settings.data.messengerPageId)
    }
  }, [settings])

  useEffect(() => {
    if (pageId && isLoaded && typeof window !== 'undefined' && window.fbAsyncInit) {
      window.fbAsyncInit()
    }
  }, [pageId, isLoaded])

  if (!pageId) return null

  return (
    <>
      <Script
        src="https://connect.facebook.net/en_US/sdk/xfbml.customerchat.js"
        strategy="afterInteractive"
        onLoad={() => setIsLoaded(true)}
      />
      <div id="fb-root" />
      <div
        className="fb-customerchat"
        attribution="setup_tool"
        page_id={pageId}
        theme_color="#0084ff"
        logged_in_greeting="Hi! How can we help you today?"
        logged_out_greeting="Hi! Log in to chat with us."
      />
    </>
  )
}
