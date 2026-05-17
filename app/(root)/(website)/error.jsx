'use client'

import { useEffect } from 'react'

export default function Error({ error, reset }) {
  useEffect(() => {
    // Simple console logging only - no state updates or network requests
    console.error('Website error boundary caught:', error?.message || 'Unknown error')
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] px-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong!</h2>
      
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 max-w-2xl w-full">
        <p className="text-red-800 font-medium mb-2">Error: {error?.message || 'Unknown error'}</p>
        {error?.digest && (
          <p className="text-red-600 text-sm mb-2">Digest: {error.digest}</p>
        )}
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
