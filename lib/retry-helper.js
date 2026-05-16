import GoogleAPILogModel from '@/models/GoogleAPILog.model'

/**
 * Retry function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {Object} options - Retry options
 * @param {number} options.maxRetries - Maximum number of retries (default: 3)
 * @param {number} options.initialDelay - Initial delay in ms (default: 1000)
 * @param {number} options.backoffMultiplier - Backoff multiplier (default: 2)
 * @param {boolean} options.logErrors - Log errors to database (default: true)
 * @returns {Promise} - Result of the function
 */
export async function retryWithBackoff(fn, options = {}) {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    backoffMultiplier = 2,
    logErrors = true,
    api = 'Unknown',
    endpoint = 'Unknown',
    method = 'GET',
    userId = null
  } = options

  let lastError = null
  let attempt = 0

  while (attempt <= maxRetries) {
    try {
      const startTime = Date.now()
      const result = await fn()
      const duration = Date.now() - startTime

      // Log success
      if (logErrors) {
        await GoogleAPILogModel.create({
          api,
          endpoint,
          method,
          status: 'success',
          statusCode: 200,
          duration,
          userId
        }).catch(err => console.error('Failed to log API success:', err))
      }

      return result
    } catch (error) {
      lastError = error
      attempt++

      // Log error
      if (logErrors) {
        await GoogleAPILogModel.create({
          api,
          endpoint,
          method,
          status: attempt <= maxRetries ? 'retry' : 'error',
          error: error.message,
          duration: 0,
          userId
        }).catch(err => console.error('Failed to log API error:', err))
      }

      if (attempt <= maxRetries) {
        const delay = initialDelay * Math.pow(backoffMultiplier, attempt - 1)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  // All retries failed
  throw lastError
}

/**
 * Send email alert for critical API failures
 */
export async function sendCriticalFailureAlert(api, error, context = {}) {
  try {
    const { sendMail } = await import('@/lib/sendMail')
    
    const mailOptions = {
      to: process.env.ADMIN_EMAIL || 'admin@alhilalpanjabi.com',
      subject: `Critical API Failure: ${api}`,
      html: `
        <h2>Critical API Failure Detected</h2>
        <p><strong>API:</strong> ${api}</p>
        <p><strong>Error:</strong> ${error.message}</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        <p><strong>Context:</strong></p>
        <pre>${JSON.stringify(context, null, 2)}</pre>
        <p>Please check the system logs and take appropriate action.</p>
      `
    }

    await sendMail(mailOptions)
  } catch (err) {
    console.error('Failed to send critical failure alert:', err)
  }
}
