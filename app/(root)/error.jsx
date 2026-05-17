'use client'

import { useEffect } from 'react'

export default function Error({ error, reset }) {
  useEffect(() => {
    // Simple console logging only - prevent infinite loops
    console.error('Root error boundary caught:', error?.message || 'Unknown error')
  }, [error])

  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-gray-50">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Oops!</h1>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 max-w-2xl w-full mx-4">
            <p className="text-red-800 font-medium mb-2">Error: {error?.message || 'Unknown error'}</p>
            {error?.digest && (
              <p className="text-red-600 text-sm mb-2">Error ID: {error.digest}</p>
            )}
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
