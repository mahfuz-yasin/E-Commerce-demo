// Error logging utility for production debugging
export const logError = (error, context = '') => {
  const errorInfo = {
    message: error?.message || 'Unknown error',
    stack: error?.stack || 'No stack trace',
    digest: error?.digest || 'No digest',
    context,
    timestamp: new Date().toISOString(),
    userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server',
    url: typeof window !== 'undefined' ? window.location.href : 'server-side'
  }
  
  // Log to console in development
  console.error('=== ERROR LOG ===', errorInfo)
  
  // Send to API for logging in production
  if (typeof window !== 'undefined') {
    fetch('/api/log-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorInfo)
    }).catch(() => {})
  }
  
  return errorInfo
}

// Safe data fetching wrapper
export const safeFetch = async (url, options = {}) => {
  try {
    const response = await fetch(url, options)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    logError(error, `Fetching ${url}`)
    return { success: false, error: error.message }
  }
}
