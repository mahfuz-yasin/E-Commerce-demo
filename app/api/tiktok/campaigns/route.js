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
    const status = searchParams.get('status') // ACTIVE, PAUSED, etc.

    const endpoint = `/campaign/get/`
    const data = {
      advertiser_id: config.adAccountId,
      page: page,
      page_size: pageSize,
      filtering: status ? { status: [status] } : undefined
    }

    const result = await makeTikTokRequest(endpoint, {
      method: 'POST',
      data: data
    })

    if (!result || !result.data) {
      return response(false, 500, 'Failed to fetch campaigns from TikTok')
    }

    return response(true, 200, 'Campaigns retrieved successfully', result.data)
  } catch (error) {
    console.error('Error fetching TikTok campaigns:', error)
    return response(false, 500, error.message || 'Failed to fetch campaigns')
  }
}

export async function POST(request) {
  try {
    await connectDB()

    const body = await request.json()
    const { campaignId, status, name, budget } = body

    if (!campaignId) {
      return response(false, 400, 'Campaign ID is required')
    }

    const config = await TikTokConfigModel.getConfig()

    const endpoint = `/campaign/update/`
    const data = {
      advertiser_id: config.adAccountId,
      campaign_ids: [campaignId],
      operation_type: status ? 'SET_STATUS' : 'UPDATE',
      operation_status: status || undefined,
      campaign_name: name || undefined,
      budget: budget || undefined
    }

    const result = await makeTikTokRequest(endpoint, {
      method: 'POST',
      data: data
    })

    if (!result || !result.data) {
      return response(false, 500, 'Failed to update campaign')
    }

    return response(true, 200, 'Campaign updated successfully', result.data)
  } catch (error) {
    console.error('Error updating TikTok campaign:', error)
    return response(false, 500, error.message || 'Failed to update campaign')
  }
}
