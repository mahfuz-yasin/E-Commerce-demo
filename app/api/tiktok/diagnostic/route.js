import { connectDB } from "@/lib/databaseConnection"
import { response } from "@/lib/helperFunction"
import TikTokConfigModel from "@/models/TikTokConfig.model"
import TikTokWebhookLogModel from "@/models/TikTokWebhookLog.model"
import { makeTikTokRequest } from "@/lib/tiktok-auth"
import axios from 'axios'

export async function GET(request) {
  try {
    await connectDB()

    const config = await TikTokConfigModel.getConfig()
    const diagnosticResults = {
      pixel: { status: 'unknown', message: '', lastEventTime: null },
      eventsApi: { status: 'unknown', message: '', lastEventTime: null },
      catalog: { status: 'unknown', message: '', lastSyncTime: null },
      webhook: { status: 'unknown', message: '', lastEventTime: null },
      accessToken: { status: 'unknown', message: '', expiryDate: null }
    }

    // Check Pixel Status
    if (config.pixelId) {
      try {
        const pixelResponse = await axios.get(`https://business-api.tiktok.com/open_api/v1.3/pixel/info/`, {
          headers: { 'Access-Token': config.accessToken },
          params: { pixel_id: config.pixelId }
        })
        
        if (pixelResponse.data?.data) {
          diagnosticResults.pixel = {
            status: 'valid',
            message: 'Pixel is active and receiving events',
            lastEventTime: pixelResponse.data.data.last_event_time || null
          }
        }
      } catch (error) {
        diagnosticResults.pixel = {
          status: 'error',
          message: 'Failed to verify pixel status',
          lastEventTime: null
        }
      }
    } else {
      diagnosticResults.pixel = {
        status: 'not_configured',
        message: 'Pixel ID not configured',
        lastEventTime: null
      }
    }

    // Check Events API Status
    if (config.accessToken && config.isCAPIActive === 'active') {
      try {
        const tokenExpiry = config.tokenExpiry
        const now = new Date()
        const isExpired = tokenExpiry && new Date(tokenExpiry) < now

        diagnosticResults.accessToken = {
          status: isExpired ? 'expired' : 'valid',
          message: isExpired ? 'Access token has expired' : 'Access token is valid',
          expiryDate: tokenExpiry || null
        }

        diagnosticResults.eventsApi = {
          status: isExpired ? 'error' : 'valid',
          message: isExpired ? 'Token expired, refresh required' : 'Events API is configured',
          lastEventTime: config.lastEventSent || null
        }
      } catch (error) {
        diagnosticResults.eventsApi = {
          status: 'error',
          message: 'Failed to verify Events API status',
          lastEventTime: null
        }
      }
    } else {
      diagnosticResults.eventsApi = {
        status: 'not_configured',
        message: 'Events API not configured or inactive',
        lastEventTime: null
      }
    }

    // Check Catalog Status
    if (config.catalogId && config.isCatalogActive === 'active') {
      try {
        const feedResponse = await axios.get(config.catalogFeedUrl || '', { timeout: 5000 })
        
        if (feedResponse.status === 200) {
          diagnosticResults.catalog = {
            status: 'valid',
            message: 'Catalog feed is accessible',
            lastSyncTime: config.catalogLastSync || null
          }
        }
      } catch (error) {
        diagnosticResults.catalog = {
          status: 'error',
          message: 'Catalog feed is not accessible',
          lastSyncTime: config.catalogLastSync || null
        }
      }
    } else {
      diagnosticResults.catalog = {
        status: 'not_configured',
        message: 'Catalog not configured or inactive',
        lastSyncTime: config.catalogLastSync || null
      }
    }

    // Check Webhook Status
    if (config.webhookSecret) {
      try {
        const recentWebhooks = await TikTokWebhookLogModel.find({
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }).sort({ createdAt: -1 }).limit(1)

        if (recentWebhooks.length > 0) {
          diagnosticResults.webhook = {
            status: 'valid',
            message: 'Webhook is receiving events',
            lastEventTime: recentWebhooks[0].createdAt
          }
        } else {
          diagnosticResults.webhook = {
            status: 'warning',
            message: 'Webhook configured but no recent events',
            lastEventTime: null
          }
        }
      } catch (error) {
        diagnosticResults.webhook = {
          status: 'error',
          message: 'Failed to check webhook status',
          lastEventTime: null
        }
      }
    } else {
      diagnosticResults.webhook = {
        status: 'not_configured',
        message: 'Webhook not configured',
        lastEventTime: null
      }
    }

    return response(true, 200, 'Diagnostic completed successfully', diagnosticResults)
  } catch (error) {
    console.error('Error running diagnostic:', error)
    return response(false, 500, error.message || 'Failed to run diagnostic')
  }
}
