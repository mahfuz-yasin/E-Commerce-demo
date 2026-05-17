'use client'

import { useEffect } from 'react'

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('Root error boundary caught:', error)
  }, [error])

  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-gray-50">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Oops!</h1>
          <p className="text-gray-600 mb-6 text-lg">{error?.message || 'Something went wrong'}</p>
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
