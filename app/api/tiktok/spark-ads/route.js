import { connectDB } from "@/lib/databaseConnection"
import { response } from "@/lib/helperFunction"
import TikTokConfigModel from "@/models/TikTokConfig.model"
import { makeTikTokRequest } from "@/lib/tiktok-auth"

export async function POST(request) {
  try {
    await connectDB()

    const body = await request.json()
    const { postId, adGroupId, campaignId, name, status } = body

    if (!postId) {
      return response(false, 400, 'TikTok Post ID is required')
    }

    const config = await TikTokConfigModel.getConfig()

    if (!config.adAccountId) {
      return response(false, 400, 'Ad Account ID is required')
    }

    const endpoint = `/ad/create/`
    const data = {
      advertiser_id: config.adAccountId,
      adgroup_id: adGroupId,
      ad_name: name || `Spark Ad - ${postId}`,
      identity_type: 'SPARK',
      creative_id: postId,
      status: status || 'ENABLED'
    }

    const result = await makeTikTokRequest(endpoint, {
      method: 'POST',
      data: data
    })

    if (!result || !result.data) {
      return response(false, 500, 'Failed to create Spark Ad')
    }

    // Save post ID in settings for tracking
    if (!config.sparkPostIds) {
      config.sparkPostIds = []
    }
    if (!config.sparkPostIds.includes(postId)) {
      config.sparkPostIds.push(postId)
      await config.save()
    }

    return response(true, 200, 'Spark Ad created successfully', result.data)
  } catch (error) {
    console.error('Error creating Spark Ad:', error)
    return response(false, 500, error.message || 'Failed to create Spark Ad')
  }
}

export async function GET(request) {
  try {
    await connectDB()

    const config = await TikTokConfigModel.getConfig()

    return response(true, 200, 'Spark Ads config retrieved', {
      sparkPostIds: config.sparkPostIds || [],
      businessCenterId: config.businessCenterId || null,
      adAccountId: config.adAccountId || null
    })
  } catch (error) {
    console.error('Error fetching Spark Ads config:', error)
    return response(false, 500, error.message || 'Failed to fetch Spark Ads config')
  }
}

export async function DELETE(request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('postId')

    if (!postId) {
      return response(false, 400, 'Post ID is required')
    }

    const config = await TikTokConfigModel.getConfig()

    if (config.sparkPostIds && config.sparkPostIds.includes(postId)) {
      config.sparkPostIds = config.sparkPostIds.filter(id => id !== postId)
      await config.save()
    }

    return response(true, 200, 'Post ID removed from Spark Ads')
  } catch (error) {
    console.error('Error removing Spark Ad:', error)
    return response(false, 500, error.message || 'Failed to remove Spark Ad')
  }
}
