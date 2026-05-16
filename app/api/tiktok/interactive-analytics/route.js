import { connectDB } from "@/lib/databaseConnection"
import { response } from "@/lib/helperFunction"
import TikTokConfigModel from "@/models/TikTokConfig.model"
import { makeTikTokRequest } from "@/lib/tiktok-auth"
import OrderModel from "@/models/Order.model"

/**
 * Extract interactive component identifiers from ttclid
 * Analyze which ad extensions generate highest ROAS
 */
export async function GET(request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const config = await TikTokConfigModel.getConfig()

    if (!config.adAccountId) {
      return response(false, 400, 'Ad Account ID is required')
    }

    // Fetch orders with TikTok tracking data
    const orders = await OrderModel.find({
      createdAt: {
        $gte: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        $lte: endDate ? new Date(endDate) : new Date()
      },
      paymentMethod: 'TIKTOK_SHOP'
    }).lean()

    // Extract and analyze interactive component data
    const componentAnalytics = {}
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)

    orders.forEach(order => {
      const ttclid = order.ttclid || order.tiktokLiveId || 'unknown'
      const componentId = extractComponentId(ttclid)
      
      if (!componentAnalytics[componentId]) {
        componentAnalytics[componentId] = {
          componentId,
          orderCount: 0,
          revenue: 0,
          roas: 0
        }
      }
      
      componentAnalytics[componentId].orderCount += 1
      componentAnalytics[componentId].revenue += order.totalAmount || 0
    })

    // Calculate ROAS for each component
    Object.keys(componentAnalytics).forEach(key => {
      componentAnalytics[key].roas = componentAnalytics[key].revenue / (componentAnalytics[key].orderCount || 1)
    })

    // Sort by ROAS descending
    const sortedAnalytics = Object.values(componentAnalytics).sort((a, b) => b.roas - a.roas)

    return response(true, 200, 'Interactive analytics retrieved successfully', {
      componentAnalytics: sortedAnalytics,
      totalOrders: orders.length,
      totalRevenue,
      topComponent: sortedAnalytics[0] || null
    })
  } catch (error) {
    console.error('Error fetching interactive analytics:', error)
    return response(false, 500, error.message || 'Failed to fetch interactive analytics')
  }
}

/**
 * Extract component ID from ttclid or tracking parameters
 * @param {string} ttclid - TikTok Click ID
 * @returns {string} Component identifier
 */
function extractComponentId(ttclid) {
  if (!ttclid || ttclid === 'unknown') return 'direct'
  
  // Parse ttclid to extract component information
  // This is a simplified implementation - in production, use TikTok's tracking API
  try {
    if (ttclid.includes('_')) {
      const parts = ttclid.split('_')
      return parts[0] || 'unknown'
    }
    return ttclid.substring(0, 10) || 'unknown'
  } catch (error) {
    return 'unknown'
  }
}
