import { connectDB } from "@/lib/databaseConnection"
import { response } from "@/lib/helperFunction"
import TikTokConfigModel from "@/models/TikTokConfig.model"
import { makeTikTokRequest } from "@/lib/tiktok-auth"

/**
 * Fetch TikTok Commercial Audio Library - trending tracks
 */
export async function GET(request) {
  try {
    await connectDB()

    const config = await TikTokConfigModel.getConfig()

    if (!config.adAccountId) {
      return response(false, 400, 'Ad Account ID is required')
    }

    const { searchParams } = new URL(request.url)
    const region = searchParams.get('region') || 'BD'
    const limit = parseInt(searchParams.get('limit') || '10')

    const endpoint = `/open_api/v1.4/commercial/audio/library/`
    const data = {
      advertiser_id: config.adAccountId,
      region: region,
      page_size: Math.min(limit, 50),
      page: 1,
      sort_by: 'trending'
    }

    const result = await makeTikTokRequest(endpoint, {
      method: 'POST',
      data: data
    })

    if (!result || !result.data) {
      return response(false, 500, 'Failed to fetch commercial audio library')
    }

    return response(true, 200, 'Commercial audio library fetched successfully', {
      tracks: result.data.list || [],
      total: result.data.page_info?.total_number || 0,
      region: region
    })
  } catch (error) {
    console.error('Error fetching commercial audio:', error)
    return response(false, 500, error.message || 'Failed to fetch commercial audio library')
  }
}
