import { connectDB } from "@/lib/databaseConnection"
import { response } from "@/lib/helperFunction"
import TikTokConfigModel from "@/models/TikTokConfig.model"
import { makeTikTokRequest } from "@/lib/tiktok-auth"

/**
 * Create Smart Plus ad (automated ad creation)
 */
export async function POST(request) {
  try {
    await connectDB()

    const body = await request.json()
    const { productId, productImage, productTitle, productPrice, productUrl, campaignId, adGroupId } = body

    if (!productId || !productImage) {
      return response(false, 400, 'Product ID and image are required')
    }

    const config = await TikTokConfigModel.getConfig()

    if (!config.adAccountId) {
      return response(false, 400, 'Ad Account ID is required')
    }

    // Step 1: Create creative
    const creativeEndpoint = `/creative/create/`
    const creativeData = {
      advertiser_id: config.adAccountId,
      creative_name: `Smart Plus - ${productTitle}`,
      creative_type: 'VIDEO', // or IMAGE
      video_id: body.videoId || undefined,
      image_id: body.imageId || undefined,
      creative_materials: [{
        type: 'IMAGE',
        url: productImage
      }]
    }

    const creativeResult = await makeTikTokRequest(creativeEndpoint, {
      method: 'POST',
      data: creativeData
    })

    if (!creativeResult || !creativeResult.data) {
      return response(false, 500, 'Failed to create creative')
    }

    const creativeId = creativeResult.data.creative_id

    // Step 2: Create ad with the creative
    const adEndpoint = `/ad/create/`
    const adData = {
      advertiser_id: config.adAccountId,
      adgroup_id: adGroupId,
      ad_name: `Smart Plus Ad - ${productTitle}`,
      identity_type: 'PAID',
      creative_id: creativeId,
      status: 'ENABLED'
    }

    const adResult = await makeTikTokRequest(adEndpoint, {
      method: 'POST',
      data: adData
    })

    if (!adResult || !adResult.data) {
      return response(false, 500, 'Failed to create ad')
    }

    return response(true, 200, 'Smart Plus ad created successfully', {
      creativeId,
      adId: adResult.data.ad_id
    })
  } catch (error) {
    console.error('Error creating Smart Plus ad:', error)
    return response(false, 500, error.message || 'Failed to create Smart Plus ad')
  }
}

/**
 * Get Smart Plus ad recommendations
 */
export async function GET(request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('product_id')

    if (!productId) {
      return response(false, 400, 'Product ID is required')
    }

    // TODO: Implement TikTok Smart Plus recommendation API
    // This would call TikTok's Smart Plus API to get ad recommendations
    
    return response(true, 200, 'Smart Plus recommendations retrieved', {
      recommended_creatives: [],
      suggested_audiences: [],
      estimated_performance: {}
    })
  } catch (error) {
    console.error('Error fetching Smart Plus recommendations:', error)
    return response(false, 500, error.message || 'Failed to fetch recommendations')
  }
}
