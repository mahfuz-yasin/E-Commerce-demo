import { connectDB } from "@/lib/databaseConnection"
import { response } from "@/lib/helperFunction"
import GoogleConfigModel from "@/models/GoogleConfig.model"
import axios from 'axios'

/**
 * Server-side GTM endpoint for sending events to SGTM (Server GTM)
 */
export async function POST(request) {
  try {
    await connectDB()

    const body = await request.json()
    const { eventName, eventData } = body

    const config = await GoogleConfigModel.getConfig()

    if (config.isGTMActive !== 'active' || !config.gtmContainerId) {
      return response(false, 400, 'GTM not configured or inactive')
    }

    // Check if server GTM endpoint is configured
    const serverGtmEndpoint = process.env.GTM_SERVER_ENDPOINT

    if (!serverGtmEndpoint) {
      return response(false, 400, 'Server GTM endpoint not configured')
    }

    // Prepare event payload
    const payload = {
      v: 2,
      tid: config.gtmContainerId.replace('GTM-', ''),
      event_name: eventName,
      ...eventData
    }

    // Send to server GTM endpoint
    const response = await axios.post(serverGtmEndpoint, payload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 5000
    })

    return response(true, 200, 'Event sent to server GTM successfully', response.data)
  } catch (error) {
    console.error('Error sending event to server GTM:', error)
    return response(false, 500, error.message || 'Failed to send event to server GTM')
  }
}
