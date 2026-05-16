import { response } from "@/lib/helperFunction"
import { sendTikTokEvent, generateTikTokEventId } from "@/lib/tiktok-events-api"

/**
 * Test Event API - Fires server-side events for testing
 * Used in conjunction with client-side events to verify deduplication
 */
export async function POST(request) {
  try {
    const body = await request.json()
    const { eventId, eventName, eventData, userData } = body

    if (!eventId || !eventName || !eventData) {
      return response(false, 400, 'Missing required fields: eventId, eventName, eventData')
    }

    // Send server-side event
    const result = await sendTikTokEvent(
      eventName,
      eventData,
      userData || {},
      eventId
    )

    return response(true, 200, 'Test event sent successfully', {
      eventId,
      eventName,
      success: result.success
    })
  } catch (error) {
    console.error('Error sending test event:', error)
    return response(false, 500, error.message || 'Failed to send test event')
  }
}
