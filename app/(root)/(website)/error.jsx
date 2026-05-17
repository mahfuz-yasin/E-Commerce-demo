'use client'

import { useEffect, useState } from 'react'
import { logError } from '@/lib/errorLogger'

export default function Error({ error, reset }) {
  const [errorDetails, setErrorDetails] = useState(null)

  useEffect(() => {
    // Log error details for debugging
    const loggedInfo = logError(error, 'Website error boundary')
    setErrorDetails(loggedInfo)
    
    // Also log to console with full details
    console.error('=== FULL ERROR DETAILS ===')
    console.error('Message:', error?.message)
    console.error('Stack:', error?.stack)
    console.error('Digest:', error?.digest)
    console.error('===========================')
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] px-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong!</h2>
      
      {/* Show error message in development or for debugging */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 max-w-2xl w-full">
        <p className="text-red-800 font-medium mb-2">Error: {error?.message || 'Unknown error'}</p>
        {error?.digest && (
          <p className="text-red-600 text-sm mb-2">Digest: {error.digest}</p>
        )}
        <details className="text-sm text-gray-600">
          <summary className="cursor-pointer text-red-600 hover:text-red-800">
            View technical details (for debugging)
          </summary>
          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-48">
            {error?.stack || 'No stack trace available'}
          </pre>
        </details>
      </div>

      <button
        onClick={reset}
        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
      >
        Try again
      </button>
    </div>
  )
}
