import { connectDB } from "@/lib/databaseConnection"
import { response } from "@/lib/helperFunction"
import TikTokConfigModel from "@/models/TikTokConfig.model"
import { makeTikTokRequest } from "@/lib/tiktok-auth"

export async function POST(request) {
  try {
    await connectDB()

    const body = await request.json()
    const { audienceId } = body

    if (!audienceId) {
      return response(false, 400, 'Audience ID is required')
    }

    const config = await TikTokConfigModel.getConfig()

    if (!config.adAccountId) {
      return response(false, 400, 'Ad Account ID is required')
    }

    const endpoint = `/audience/update/`
    const data = {
      advertiser_id: config.adAccountId,
      audience_ids: [audienceId],
      operation_type: 'REFRESH'
    }

    const result = await makeTikTokRequest(endpoint, {
      method: 'POST',
      data: data
    })

    if (!result || !result.data) {
      return response(false, 500, 'Failed to refresh audience')
    }

    return response(true, 200, 'Audience refreshed successfully', result.data)
  } catch (error) {
    console.error('Error refreshing audience:', error)
    return response(false, 500, error.message || 'Failed to refresh audience')
  }
}
