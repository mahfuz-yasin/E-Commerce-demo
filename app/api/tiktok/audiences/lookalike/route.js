import { connectDB } from "@/lib/databaseConnection"
import { response } from "@/lib/helperFunction"
import TikTokConfigModel from "@/models/TikTokConfig.model"
import { makeTikTokRequest } from "@/lib/tiktok-auth"

export async function POST(request) {
  try {
    await connectDB()

    const body = await request.json()
    const { sourceAudienceId, countryCode, audienceSize, name, description } = body

    if (!sourceAudienceId) {
      return response(false, 400, 'Source audience ID is required')
    }

    if (!countryCode) {
      return response(false, 400, 'Country code is required')
    }

    const config = await TikTokConfigModel.getConfig()

    if (!config.adAccountId) {
      return response(false, 400, 'Ad Account ID is required')
    }

    const audienceData = {
      advertiser_id: config.adAccountId,
      audience_name: name || `Lookalike - ${sourceAudienceId}`,
      description: description || '',
      source_audience_id: sourceAudienceId,
      country_code: countryCode.toUpperCase(),
      audience_size: audienceSize || 5, // 1-10 scale
      audience_type: 'LOOKALIKE'
    }

    const endpoint = `/audience/create/`
    const result = await makeTikTokRequest(endpoint, {
      method: 'POST',
      data: audienceData
    })

    if (!result || !result.data) {
      return response(false, 500, 'Failed to create lookalike audience')
    }

    return response(true, 200, 'Lookalike audience created successfully', result.data)
  } catch (error) {
    console.error('Error creating lookalike audience:', error)
    return response(false, 500, error.message || 'Failed to create lookalike audience')
  }
}

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
    const type = searchParams.get('type') // CUSTOM, LOOKALIKE, ALL

    const endpoint = `/audience/get/`
    const data = {
      advertiser_id: config.adAccountId,
      page: page,
      page_size: pageSize,
      filtering: type ? { audience_type: [type] } : undefined
    }

    const result = await makeTikTokRequest(endpoint, {
      method: 'POST',
      data: data
    })

    if (!result || !result.data) {
      return response(false, 500, 'Failed to fetch audiences from TikTok')
    }

    return response(true, 200, 'Audiences retrieved successfully', result.data)
  } catch (error) {
    console.error('Error fetching TikTok audiences:', error)
    return response(false, 500, error.message || 'Failed to fetch audiences')
  }
}
