// Error logging utility for production debugging
// NOTE: This function should NOT make network requests as it can cause infinite loops
// when called from error boundaries during render errors
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
  
  // Only log to console - avoid network requests from error boundaries
  // to prevent infinite loops during error handling
  console.error('=== ERROR LOG ===', errorInfo)
  
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
