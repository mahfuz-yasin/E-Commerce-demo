import { connectDB } from "@/lib/databaseConnection"
import { response } from "@/lib/helperFunction"
import TikTokConfigModel from "@/models/TikTokConfig.model"
import TikTokWebhookLogModel from "@/models/TikTokWebhookLog.model"
import crypto from 'crypto'

/**
 * Verify TikTok webhook signature
 * @param {string} payload - Raw request body
 * @param {string} signature - X-TikTok-Signature header
 * @param {string} secret - Webhook secret
 * @returns {boolean} Whether signature is valid
 */
function verifyWebhookSignature(payload, signature, secret) {
  if (!signature || !secret) return false
  
  try {
    const hmac = crypto.createHmac('sha256', secret)
    hmac.update(payload)
    const expectedSignature = `sha256=${hmac.digest('hex')}`
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )
  } catch (error) {
    console.error('Error verifying webhook signature:', error)
    return false
  }
}

export async function POST(request) {
  try {
    await connectDB()

    const signature = request.headers.get('x-tiktok-signature') || request.headers.get('X-TikTok-Signature')
    
    const payload = await request.text()
    const eventData = JSON.parse(payload)

    const config = await TikTokConfigModel.getConfig()
    
    // Verify signature if webhook secret is configured
    let verified = false
    if (config.webhookSecret) {
      verified = verifyWebhookSignature(payload, signature, config.webhookSecret)
    }

    // Log the webhook event
    const webhookLog = await TikTokWebhookLogModel.create({
      eventType: eventData.event_type || 'unknown',
      eventData: eventData,
      signature: signature,
      verified: verified,
      processed: false
    })

    // Handle different event types
    switch (eventData.event_type) {
      case 'leadgen':
        await handleLeadGenEvent(eventData, webhookLog._id)
        break
      case 'conversion':
        await handleConversionEvent(eventData, webhookLog._id)
        break
      case 'campaign_update':
        await handleCampaignUpdateEvent(eventData, webhookLog._id)
        break
      default:
        console.log('Unhandled event type:', eventData.event_type)
    }

    return response(true, 200, 'Webhook received successfully')
  } catch (error) {
    console.error('Error processing webhook:', error)
    return response(false, 500, error.message || 'Failed to process webhook')
  }
}

/**
 * Handle lead generation events
 */
async function handleLeadGenEvent(eventData, logId) {
  try {
    // Process lead data
    console.log('Processing leadgen event:', eventData)
    
    await TikTokWebhookLogModel.findByIdAndUpdate(logId, {
      processed: true,
      processedAt: new Date()
    })
  } catch (error) {
    console.error('Error handling leadgen event:', error)
    await TikTokWebhookLogModel.findByIdAndUpdate(logId, {
      error: error.message
    })
  }
}

/**
 * Handle conversion events
 */
async function handleConversionEvent(eventData, logId) {
  try {
    // Process conversion data
    console.log('Processing conversion event:', eventData)
    
    await TikTokWebhookLogModel.findByIdAndUpdate(logId, {
      processed: true,
      processedAt: new Date()
    })
  } catch (error) {
    console.error('Error handling conversion event:', error)
    await TikTokWebhookLogModel.findByIdAndUpdate(logId, {
      error: error.message
    })
  }
}

/**
 * Handle campaign update events
 */
async function handleCampaignUpdateEvent(eventData, logId) {
  try {
    // Process campaign update data
    console.log('Processing campaign update event:', eventData)
    
    await TikTokWebhookLogModel.findByIdAndUpdate(logId, {
      processed: true,
      processedAt: new Date()
    })
  } catch (error) {
    console.error('Error handling campaign update event:', error)
    await TikTokWebhookLogModel.findByIdAndUpdate(logId, {
      error: error.message
    })
  }
}

export async function GET(request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const mode = searchParams.get('hub.mode')
    const challenge = searchParams.get('hub.challenge')
    const verifyToken = searchParams.get('hub.verify_token')

    const config = await TikTokConfigModel.getConfig()

    // Webhook verification endpoint
    if (mode === 'subscribe' && verifyToken === config.webhookVerifyToken) {
      return new Response(challenge, {
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      })
    }

    return response(false, 403, 'Verification failed')
  } catch (error) {
    console.error('Error in webhook verification:', error)
    return response(false, 500, 'Webhook verification failed')
  }
}
