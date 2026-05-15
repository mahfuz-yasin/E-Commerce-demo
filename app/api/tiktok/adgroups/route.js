import { connectDB } from "@/lib/databaseConnection"
import { response } from "@/lib/helperFunction"
import TikTokConfigModel from "@/models/TikTokConfig.model"
import { makeTikTokRequest } from "@/lib/tiktok-auth"

export async function GET(request) {
  try {
    await connectDB()

    const config = await TikTokConfigModel.getConfig()

    if (!config.adAccountId) {
      return response(false, 400, 'Ad Account ID is required')
    }

    const { searchParams } = new URL(request.url)
    const pageSize = parseInt(searchParams.get('page_size') || '20')
    const page = parseInt(searchParams.get('page') || '1')
    const campaignId = searchParams.get('campaign_id')
    const status = searchParams.get('status')

    const endpoint = `/adgroup/get/`
    const data = {
      advertiser_id: config.adAccountId,
      page: page,
      page_size: pageSize,
      filtering: {
        campaign_ids: campaignId ? [campaignId] : undefined,
        status: status ? [status] : undefined
      }
    }

    const result = await makeTikTokRequest(endpoint, {
      method: 'POST',
      data: data
    })

    if (!result || !result.data) {
      return response(false, 500, 'Failed to fetch ad groups from TikTok')
    }

    return response(true, 200, 'Ad groups retrieved successfully', result.data)
  } catch (error) {
    console.error('Error fetching TikTok ad groups:', error)
    return response(false, 500, error.message || 'Failed to fetch ad groups')
  }
}
