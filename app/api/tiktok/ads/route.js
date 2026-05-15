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
    const adGroupId = searchParams.get('adgroup_id')
    const status = searchParams.get('status')

    const endpoint = `/ad/get/`
    const data = {
      advertiser_id: config.adAccountId,
      page: page,
      page_size: pageSize,
      filtering: {
        adgroup_ids: adGroupId ? [adGroupId] : undefined,
        status: status ? [status] : undefined
      }
    }

    const result = await makeTikTokRequest(endpoint, {
      method: 'POST',
      data: data
    })

    if (!result || !result.data) {
      return response(false, 500, 'Failed to fetch ads from TikTok')
    }

    return response(true, 200, 'Ads retrieved successfully', result.data)
  } catch (error) {
    console.error('Error fetching TikTok ads:', error)
    return response(false, 500, error.message || 'Failed to fetch ads')
  }
}

export async function POST(request) {
  try {
    await connectDB()

    const body = await request.json()
    const { adGroupId, name, identity, creativeId, status } = body

    if (!adGroupId) {
      return response(false, 400, 'Ad Group ID is required')
    }

    const config = await TikTokConfigModel.getConfig()

    const endpoint = `/ad/create/`
    const data = {
      advertiser_id: config.adAccountId,
      adgroup_id: adGroupId,
      ad_name: name || 'New Ad',
      identity_type: identity || 'PAID',
      creative_id: creativeId,
      status: status || 'ENABLED'
    }

    const result = await makeTikTokRequest(endpoint, {
      method: 'POST',
      data: data
    })

    if (!result || !result.data) {
      return response(false, 500, 'Failed to create ad')
    }

    return response(true, 200, 'Ad created successfully', result.data)
  } catch (error) {
    console.error('Error creating TikTok ad:', error)
    return response(false, 500, error.message || 'Failed to create ad')
  }
}
