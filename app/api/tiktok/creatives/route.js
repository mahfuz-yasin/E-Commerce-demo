import { connectDB } from "@/lib/databaseConnection"
import { response } from "@/lib/helperFunction"
import TikTokConfigModel from "@/models/TikTokConfig.model"
import { makeTikTokRequest } from "@/lib/tiktok-auth"

const FATIGUE_CTR_THRESHOLD = 0.5 // 0.5% CTR threshold for ad fatigue detection

/**
 * Fetch ad creatives with CTR monitoring
 */
export async function GET(request) {
  try {
    await connectDB()

    const config = await TikTokConfigModel.getConfig()

    if (!config.adAccountId) {
      return response(false, 400, 'Ad Account ID is required')
    }

    const { searchParams } = new URL(request.url)
    const campaignId = searchParams.get('campaignId')
    const pageSize = parseInt(searchParams.get('pageSize') || '50')

    const endpoint = `/ad/creative/get/`
    const data = {
      advertiser_id: config.adAccountId,
      page_size: Math.min(pageSize, 100),
      page: 1
    }

    if (campaignId) {
      data.campaign_ids = [campaignId]
    }

    const result = await makeTikTokRequest(endpoint, {
      method: 'POST',
      data: data
    })

    if (!result || !result.data) {
      return response(false, 500, 'Failed to fetch ad creatives')
    }

    // Analyze creatives for fatigue
    const creativesWithStatus = result.data.list?.map(creative => ({
      ...creative,
      ctr: creative.click_rate || 0,
      isFatigued: (creative.click_rate || 0) < FATIGUE_CTR_THRESHOLD,
      fatigueScore: calculateFatigueScore(creative)
    })) || []

    return response(true, 200, 'Ad creatives fetched successfully', {
      creatives: creativesWithStatus,
      fatigueThreshold: FATIGUE_CTR_THRESHOLD,
      total: result.data.page_info?.total_number || 0
    })
  } catch (error) {
    console.error('Error fetching ad creatives:', error)
    return response(false, 500, error.message || 'Failed to fetch ad creatives')
  }
}

/**
 * Calculate fatigue score based on CTR decline over time
 * @param {object} creative - Creative data with metrics
 * @returns {number} Fatigue score (0-100)
 */
function calculateFatigueScore(creative) {
  const ctr = creative.click_rate || 0
  const impressions = creative.impressions || 0
  const daysSinceCreation = creative.create_time ? 
    Math.floor((Date.now() - new Date(creative.create_time).getTime()) / (1000 * 60 * 60 * 24)) : 0

  // Simple fatigue calculation: lower CTR + older age + high impressions = higher fatigue
  let fatigueScore = 0
  
  if (ctr < 0.3) fatigueScore += 40
  else if (ctr < 0.5) fatigueScore += 20
  else if (ctr < 0.8) fatigueScore += 10
  
  if (daysSinceCreation > 30) fatigueScore += 30
  else if (daysSinceCreation > 14) fatigueScore += 15
  else if (daysSinceCreation > 7) fatigueScore += 5
  
  if (impressions > 100000) fatigueScore += 30
  else if (impressions > 50000) fatigueScore += 15
  else if (impressions > 10000) fatigueScore += 5

  return Math.min(100, fatigueScore)
}

/**
 * Refresh creative with new image from Cloudinary
 */
export async function POST(request) {
  try {
    await connectDB()

    const body = await request.json()
    const { creativeId, newImageUrl } = body

    if (!creativeId || !newImageUrl) {
      return response(false, 400, 'Creative ID and new image URL are required')
    }

    const config = await TikTokConfigModel.getConfig()

    if (!config.adAccountId) {
      return response(false, 400, 'Ad Account ID is required')
    }

    const endpoint = `/ad/creative/update/`
    const data = {
      advertiser_id: config.adAccountId,
      creative_id: creativeId,
      image_url: newImageUrl
    }

    const result = await makeTikTokRequest(endpoint, {
      method: 'POST',
      data: data
    })

    if (!result || !result.data) {
      return response(false, 500, 'Failed to update creative')
    }

    return response(true, 200, 'Creative updated successfully', result.data)
  } catch (error) {
    console.error('Error updating creative:', error)
    return response(false, 500, error.message || 'Failed to update creative')
  }
}
