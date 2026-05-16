import { connectDB } from "@/lib/databaseConnection"
import { response } from "@/lib/helperFunction"
import { getGA4OverviewMetrics, getEcommercePerformance } from "@/lib/ga4-reporting"

/**
 * Get unified analytics across platforms (Google, Facebook, TikTok)
 */
export async function GET(request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate') || '30daysAgo'
    const endDate = searchParams.get('endDate') || 'today'

    // Fetch Google Analytics data
    let googleData = { revenue: 0, conversions: 0, events: 0 }
    try {
      const overview = await getGA4OverviewMetrics(startDate, endDate)
      const ecommerce = await getEcommercePerformance(startDate, endDate)
      googleData = {
        revenue: parseFloat(ecommerce.totalRevenue || 0),
        conversions: parseFloat(overview.totalPurchasers || 0),
        events: parseFloat(overview.eventCount || 0)
      }
    } catch (error) {
      console.error('Error fetching Google data:', error)
    }

    // Fetch Facebook data (from existing CAPI integration)
    let facebookData = { revenue: 0, conversions: 0, events: 0 }
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/facebook/analytics?startDate=${startDate}&endDate=${endDate}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          facebookData = {
            revenue: parseFloat(data.data.revenue || 0),
            conversions: parseFloat(data.data.conversions || 0),
            events: parseFloat(data.data.events || 0)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching Facebook data:', error)
    }

    // Fetch TikTok data (from existing TikTok API integration)
    let tiktokData = { revenue: 0, conversions: 0, events: 0 }
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/tiktok/analytics?startDate=${startDate}&endDate=${endDate}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          tiktokData = {
            revenue: parseFloat(data.data.revenue || 0),
            conversions: parseFloat(data.data.conversions || 0),
            events: parseFloat(data.data.events || 0)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching TikTok data:', error)
    }

    // Calculate unified metrics
    const totalRevenue = googleData.revenue + facebookData.revenue + tiktokData.revenue
    const totalConversions = googleData.conversions + facebookData.conversions + tiktokData.conversions
    const totalEvents = googleData.events + facebookData.events + tiktokData.events

    // Calculate ROAS (Return on Ad Spend)
    const adSpend = 0 // This would need to be fetched from ad platforms
    const roas = adSpend > 0 ? totalRevenue / adSpend : 0

    // Channel contribution
    const channelContribution = {
      google: {
        revenue: googleData.revenue,
        conversions: googleData.conversions,
        revenueShare: totalRevenue > 0 ? (googleData.revenue / totalRevenue * 100).toFixed(2) : 0,
        conversionShare: totalConversions > 0 ? (googleData.conversions / totalConversions * 100).toFixed(2) : 0
      },
      facebook: {
        revenue: facebookData.revenue,
        conversions: facebookData.conversions,
        revenueShare: totalRevenue > 0 ? (facebookData.revenue / totalRevenue * 100).toFixed(2) : 0,
        conversionShare: totalConversions > 0 ? (facebookData.conversions / totalConversions * 100).toFixed(2) : 0
      },
      tiktok: {
        revenue: tiktokData.revenue,
        conversions: tiktokData.conversions,
        revenueShare: totalRevenue > 0 ? (tiktokData.revenue / totalRevenue * 100).toFixed(2) : 0,
        conversionShare: totalConversions > 0 ? (tiktokData.conversions / totalConversions * 100).toFixed(2) : 0
      }
    }

    const unifiedData = {
      period: { startDate, endDate },
      totalRevenue,
      totalConversions,
      totalEvents,
      roas,
      channels: {
        google: googleData,
        facebook: facebookData,
        tiktok: tiktokData
      },
      channelContribution
    }

    return response(true, 200, 'Unified analytics fetched successfully', unifiedData)
  } catch (error) {
    console.error('Error fetching unified analytics:', error)
    return response(false, 500, error.message || 'Failed to fetch unified analytics')
  }
}
