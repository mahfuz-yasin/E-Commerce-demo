'use client'
import { useState, useEffect } from 'react'

export default function MessengerChat() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [showChat, setShowChat] = useState(false)

  useEffect(() => {
    // Load chat after 3 seconds or on user interaction
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, 3000)

    // Load immediately if user interacts with page
    const handleInteraction = () => {
      setIsLoaded(true)
      clearTimeout(timer)
    }

    document.addEventListener('click', handleInteraction)
    document.addEventListener('scroll', handleInteraction)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('click', handleInteraction)
      document.removeEventListener('scroll', handleInteraction)
    }
  }, [])

  useEffect(() => {
    if (!isLoaded) return

    const loadMessengerChat = async () => {
      try {
        const response = await fetch('/api/facebook-config')
        const data = await response.json()
        
        if (data.success && data.data.messengerPageId && data.data.messengerStatus === 'active') {
          window.fbAsyncInit = function() {
            FB.init({
              xfbml: true,
              version: 'v19.0'
            })
          }

          ;(function(d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0]
            if (d.getElementById(id)) return
            js = d.createElement(s)
            js.id = id
            js.src = `https://connect.facebook.net/en_US/sdk/xfbml.customerchat.js`
            fjs.parentNode.insertBefore(js, fjs)
          }(document, 'script', 'facebook-jssdk'))
        }
      } catch (error) {
        console.error('Error loading Messenger Chat:', error)
      }
    }

    loadMessengerChat()
  }, [isLoaded])

  if (!isLoaded) {
    return null
  }

  return (
    <>
      <div id="fb-root"></div>
      <div
        className="fb-customerchat"
        page_id={showChat ? undefined : ''}
        attribution="biz_inbox"
        theme_color="#0084ff"
        logged_in_greeting="Hi! How can we help you today?"
        logged_out_greeting="Hi! Log in to chat with us."
      />
    </>
  )
}
