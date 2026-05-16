import { connectDB } from "@/lib/databaseConnection"
import { response } from "@/lib/helperFunction"
import TikTokConfigModel from "@/models/TikTokConfig.model"
import { makeTikTokRequest } from "@/lib/tiktok-auth"

/**
 * Deploy Smart Plus Campaign
 */
export async function POST(request) {
  try {
    await connectDB()

    const body = await request.json()
    const { campaignId, action, budget } = body

    if (!campaignId || !action) {
      return response(false, 400, 'Campaign ID and action are required')
    }

    const config = await TikTokConfigModel.getConfig()

    if (!config.adAccountId) {
      return response(false, 400, 'Ad Account ID is required')
    }

    let endpoint, data

    switch (action) {
      case 'deploy':
        endpoint = `/open_api/v1.4/campaign/update/`
        data = {
          advertiser_id: config.adAccountId,
          campaign_ids: [campaignId],
          operation_status: 'enable'
        }
        break
      case 'pause':
        endpoint = `/open_api/v1.4/campaign/update/`
        data = {
          advertiser_id: config.adAccountId,
          campaign_ids: [campaignId],
          operation_status: 'disable'
        }
        break
      case 'budget':
        if (!budget) {
          return response(false, 400, 'Budget is required for budget action')
        }
        endpoint = `/open_api/v1.4/campaign/update/`
        data = {
          advertiser_id: config.adAccountId,
          campaign_ids: [campaignId],
          budget: budget
        }
        break
      default:
        return response(false, 400, 'Invalid action. Must be deploy, pause, or budget')
    }

    const result = await makeTikTokRequest(endpoint, {
      method: 'POST',
      data: data
    })

    if (!result || !result.data) {
      return response(false, 500, 'Failed to perform campaign action')
    }

    return response(true, 200, `Campaign ${action} successful`, result.data)
  } catch (error) {
    console.error('Error performing SPC action:', error)
    return response(false, 500, error.message || 'Failed to perform campaign action')
  }
}
