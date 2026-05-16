import { connectDB } from "@/lib/databaseConnection"
import { response } from "@/lib/helperFunction"
import TikTokConfigModel from "@/models/TikTokConfig.model"
import { trackTikTokPurchase, generateTikTokEventId } from "@/lib/tiktok-events-api"

/**
 * Track TikTok Live-Stream checkout events
 * Captures specialized referral parameters (tiktok_live_id, session tokens)
 * to isolate Live-Stream ROAS from standard Ad ROAS
 */
export async function POST(request) {
  try {
    await connectDB()

    const body = await request.json()
    const { orderId, value, currency, contentIds, userData, tiktokLiveId, sessionToken } = body

    if (!orderId || !value) {
      return response(false, 400, 'Missing required fields: orderId, value')
    }

    const config = await TikTokConfigModel.getConfig()

    if (!config.liveTrackingEnabled) {
      return response(false, 400, 'Live-Stream tracking is disabled')
    }

    // Generate unique event ID for deduplication
    const eventId = generateTikTokEventId()

    // Track Purchase event with Live-Stream parameters
    const result = await trackTikTokPurchase(
      orderId,
      value,
      currency || 'BDT',
      contentIds || [],
      userData,
      eventId,
      {
        num_items: contentIds?.length || 0,
        content_type: 'product_group'
      }
    )

    // Log Live-Stream attribution data
    console.log('Live-Stream Purchase tracked:', {
      orderId,
      tiktokLiveId,
      sessionToken,
      eventId,
      value
    })

    return response(true, 200, 'Live-Stream event tracked successfully', {
      eventId,
      tiktokLiveId
    })
  } catch (error) {
    console.error('Error tracking Live-Stream event:', error)
    return response(false, 500, error.message || 'Failed to track Live-Stream event')
  }
}

/**
 * Get Live-Stream session data
 */
export async function GET(request) {
  try {
    await connectDB()

    const config = await TikTokConfigModel.getConfig()

    return response(true, 200, 'Live-Stream config retrieved', {
      liveTrackingEnabled: config.liveTrackingEnabled || false,
      adAccountId: config.adAccountId || null
    })
  } catch (error) {
    console.error('Error fetching Live-Stream config:', error)
    return response(false, 500, error.message || 'Failed to fetch Live-Stream config')
  }
}
