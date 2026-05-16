import { connectDB } from "@/lib/databaseConnection"
import { response } from "@/lib/helperFunction"
import TikTokConfigModel from "@/models/TikTokConfig.model"
import { makeTikTokRequest } from "@/lib/tiktok-auth"

/**
 * Validate TikTok Spark Ads Video Authorization Code
 * Links organic videos to Ad Account's Creative Library
 */
export async function POST(request) {
  try {
    await connectDB()

    const body = await request.json()
    const authCode = body?.authCode
    const videoId = body?.videoId

    if (!authCode) {
      return response(false, 400, 'Video Authorization Code is required')
    }

    const config = await TikTokConfigModel.getConfig()

    if (!config.adAccountId) {
      return response(false, 400, 'Ad Account ID is required')
    }

    // Validate the authorization code via TikTok API
    const endpoint = `/open_api/v1.4/spark/authorize/video/`
    const data = {
      advertiser_id: config.adAccountId,
      auth_code: authCode
    }

    const result = await makeTikTokRequest(endpoint, {
      method: 'POST',
      data: data
    })

    if (!result || !result.data) {
      return response(false, 500, 'Failed to validate authorization code')
    }

    // Store the validated video ID in config
    if (result.data.video_id) {
      const existingSparkPostIds = config.sparkPostIds || []
      if (!existingSparkPostIds.includes(result.data.video_id)) {
        existingSparkPostIds.push(result.data.video_id)
        config.sparkPostIds = existingSparkPostIds
        await config.save()
      }
    }

    return response(true, 200, 'Authorization code validated successfully', {
      videoId: result.data.video_id,
      videoStatus: result.data.video_status,
      isValid: true
    })
  } catch (error) {
    console.error('Error validating Spark Ads code:', error)
    return response(false, 500, error.message || 'Failed to validate authorization code')
  }
}

/**
 * Get list of validated Spark Ads videos
 */
export async function GET(request) {
  try {
    await connectDB()

    const config = await TikTokConfigModel.getConfig()

    return response(true, 200, 'Spark Ads videos retrieved', {
      sparkPostIds: config.sparkPostIds || [],
      count: (config.sparkPostIds || []).length
    })
  } catch (error) {
    console.error('Error fetching Spark Ads videos:', error)
    return response(false, 500, error.message || 'Failed to fetch Spark Ads videos')
  }
}
