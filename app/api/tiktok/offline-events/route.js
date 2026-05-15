import { connectDB } from "@/lib/databaseConnection"
import { response } from "@/lib/helperFunction"
import TikTokConfigModel from "@/models/TikTokConfig.model"
import { makeTikTokRequest } from "@/lib/tiktok-auth"
import crypto from 'crypto'

/**
 * Hash data using SHA256
 * @param {string} data - Data to hash
 * @returns {string} SHA256 hash
 */
function hashSHA256(data) {
  if (!data) return ''
  return crypto.createHash('sha256').update(normalizeData(data)).digest('hex')
}

/**
 * Normalize data before hashing
 * @param {string} data - Data to normalize
 * @returns {string} Normalized data
 */
function normalizeData(data) {
  return data.toString().toLowerCase().trim()
}

/**
 * Extract TikTok click ID from various sources
 * @param {object} identifiers - Object containing potential ttclid sources
 * @returns {string} TikTok click ID
 */
function extractTikTokClickId(identifiers) {
  return identifiers.ttclid || identifiers.external_id || ''
}

export async function POST(request) {
  try {
    await connectDB()

    const body = await request.json()
    const { eventType, identifiers, eventTime, value, currency, customData } = body

    if (!eventType) {
      return response(false, 400, 'Event type is required')
    }

    const config = await TikTokConfigModel.getConfig()

    if (!config.offlineEventSetId) {
      return response(false, 400, 'Offline Event Set ID is not configured')
    }

    // Map event types to TikTok standard events
    const eventMapping = {
      'Purchase': 'Purchase',
      'Lead': 'Lead',
      'CompleteRegistration': 'CompleteRegistration',
      'Contact': 'Contact',
      'SubmitForm': 'SubmitForm',
      'FindLocation': 'FindLocation'
    }

    const tikTokEventType = eventMapping[eventType] || eventType

    // Prepare user data with hashed identifiers
    const userData = {
      hashed_email: identifiers.email ? hashSHA256(identifiers.email) : undefined,
      hashed_phone: identifiers.phone ? hashSHA256(identifiers.phone) : undefined,
      ttclid: extractTikTokClickId(identifiers),
      external_id: identifiers.external_id ? hashSHA256(identifiers.external_id) : undefined
    }

    // Prepare event data
    const eventData = {
      advertiser_id: config.adAccountId,
      offline_event_set_id: config.offlineEventSetId,
      event_type: tikTokEventType,
      event_time: eventTime || new Date().toISOString(),
      user_data: userData,
      value: value || undefined,
      currency: currency || 'BDT',
      custom_data: customData || {}
    }

    const endpoint = `/offline/track/`
    const result = await makeTikTokRequest(endpoint, {
      method: 'POST',
      data: eventData
    })

    if (!result || !result.data) {
      return response(false, 500, 'Failed to send offline event to TikTok')
    }

    return response(true, 200, 'Offline event sent successfully', result.data)
  } catch (error) {
    console.error('Error sending offline event:', error)
    return response(false, 500, error.message || 'Failed to send offline event')
  }
}

export async function GET(request) {
  try {
    await connectDB()

    const config = await TikTokConfigModel.getConfig()

    return response(true, 200, 'Offline events config retrieved', {
      offlineEventSetId: config.offlineEventSetId || null,
      isConfigured: !!config.offlineEventSetId
    })
  } catch (error) {
    console.error('Error fetching offline events config:', error)
    return response(false, 500, error.message || 'Failed to fetch offline events config')
  }
}
