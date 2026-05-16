import { useEffect, useRef } from 'react'

export default function useCustomConversions() {
  const activeRulesRef = useRef([])
  const timersRef = useRef({})
  const scrollListenersRef = useRef({})

  useEffect(() => {
    fetchAndApplyRules()
    return () => {
      // Cleanup
      Object.values(timersRef.current).forEach(timer => clearTimeout(timer))
      Object.values(scrollListenersRef.current).forEach(listener => {
        window.removeEventListener('scroll', listener)
      })
    }
  }, [])

  const fetchAndApplyRules = async () => {
    try {
      const response = await fetch('/api/custom-conversions')
      const data = await response.json()
      
      if (data.success && data.data) {
        const activeRules = data.data.filter(rule => rule.status === 'active')
        applyRules(activeRules)
      }
    } catch (error) {
      console.error('Error fetching custom conversion rules:', error)
    }
  }

  const applyRules = (rules) => {
    rules.forEach(rule => {
      switch (rule.ruleType) {
        case 'url_pattern':
          applyUrlPatternRule(rule)
          break
        case 'time_on_page':
          applyTimeOnPageRule(rule)
          break
        case 'scroll_depth':
          applyScrollDepthRule(rule)
          break
        case 'element_click':
          applyElementClickRule(rule)
          break
      }
    })
  }

  const applyUrlPatternRule = (rule) => {
    const currentPath = window.location.pathname
    const pattern = rule.ruleValue
    
    // Simple pattern matching (supports wildcards)
    const regex = new RegExp(pattern.replace(/\*/g, '.*'))
    if (regex.test(currentPath)) {
      sendCustomEvent(rule.eventName)
    }
  }

  const applyTimeOnPageRule = (rule) => {
    const duration = rule.ruleValueNumber * 1000 // Convert to milliseconds
    const timerId = setTimeout(() => {
      sendCustomEvent(rule.eventName)
    }, duration)
    
    timersRef.current[rule._id] = timerId
  }

  const applyScrollDepthRule = (rule) => {
    const threshold = rule.ruleValueNumber
    
    const scrollListener = () => {
      const scrollPercentage = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      if (scrollPercentage >= threshold) {
        sendCustomEvent(rule.eventName)
        window.removeEventListener('scroll', scrollListener)
        delete scrollListenersRef.current[rule._id]
      }
    }
    
    window.addEventListener('scroll', scrollListener)
    scrollListenersRef.current[rule._id] = scrollListener
  }

  const applyElementClickRule = (rule) => {
    const selector = rule.ruleValue
    
    const clickHandler = (e) => {
      if (e.target.matches(selector) || e.target.closest(selector)) {
        sendCustomEvent(rule.eventName)
      }
    }
    
    document.addEventListener('click', clickHandler)
    
    // Store cleanup function
    scrollListenersRef.current[rule._id] = () => {
      document.removeEventListener('click', clickHandler)
    }
  }

  const sendCustomEvent = async (eventName) => {
    try {
      await fetch('/api/facebook/custom-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ eventName })
      })
    } catch (error) {
      console.error('Error sending custom event:', error)
    }
  }

  return {}
}
