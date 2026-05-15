import { connectDB } from "@/lib/databaseConnection"
import { response } from "@/lib/helperFunction"
import TikTokConfigModel from "@/models/TikTokConfig.model"
import { makeTikTokRequest } from "@/lib/tiktok-auth"

export async function POST(request) {
  try {
    await connectDB()

    const body = await request.json()
    const { audienceIds } = body

    if (!audienceIds || audienceIds.length < 2) {
      return response(false, 400, 'At least 2 audience IDs are required for overlap analysis')
    }

    const config = await TikTokConfigModel.getConfig()

    if (!config.adAccountId) {
      return response(false, 400, 'Ad Account ID is required')
    }

    const endpoint = `/audience/overlap/`
    const data = {
      advertiser_id: config.adAccountId,
      audience_ids: audienceIds
    }

    const result = await makeTikTokRequest(endpoint, {
      method: 'POST',
      data: data
    })

    if (!result || !result.data) {
      return response(false, 500, 'Failed to analyze audience overlap')
    }

    return response(true, 200, 'Audience overlap analysis completed', result.data)
  } catch (error) {
    console.error('Error analyzing audience overlap:', error)
    return response(false, 500, error.message || 'Failed to analyze audience overlap')
  }
}
