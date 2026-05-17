'use client'

import { useEffect, useState } from 'react'
import { logError } from '@/lib/errorLogger'

export default function Error({ error, reset }) {
  const [errorInfo, setErrorInfo] = useState(null)

  useEffect(() => {
    // Log full error details
    const loggedInfo = logError(error, 'Root error boundary')
    setErrorInfo(loggedInfo)
    
    console.error('=== ROOT ERROR BOUNDARY ===')
    console.error('Message:', error?.message)
    console.error('Stack:', error?.stack)
    console.error('Digest:', error?.digest)
    console.error('===========================')
  }, [error])

  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-gray-50">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Oops!</h1>
          
          {/* Error details box */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 max-w-2xl w-full mx-4">
            <p className="text-red-800 font-medium mb-2">Error: {error?.message || 'Unknown error'}</p>
            {error?.digest && (
              <p className="text-red-600 text-sm mb-2">Error ID: {error.digest}</p>
            )}
            <details className="text-sm text-gray-600">
              <summary className="cursor-pointer text-red-600 hover:text-red-800">
                Show technical details
              </summary>
              <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-48">
                {error?.stack || 'No stack trace available'}
              </pre>
            </details>
          </div>

          <button
            onClick={reset}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
