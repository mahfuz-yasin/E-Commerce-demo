import { connectDB } from "@/lib/databaseConnection"
import { response } from "@/lib/helperFunction"
import { getGA4AccessToken } from "@/lib/ga4-reporting"
import axios from 'axios'

/**
 * Get attribution model comparison
 */
export async function GET(request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate') || '30daysAgo'
    const endDate = searchParams.get('endDate') || 'today'

    const accessToken = await getGA4AccessToken()
    const propertyId = process.env.NEXT_PUBLIC_GA4_PROPERTY_ID

    if (!propertyId) {
      return response(false, 400, 'GA4 Property ID not configured')
    }

    // Fetch conversion attribution data
    const requestBody = {
      dateRanges: [
        {
          startDate,
          endDate
        }
      ],
      metrics: [
        { name: 'conversions' },
        { name: 'totalRevenue' }
      ],
      dimensions: [
        { name: 'sessionDefaultChannelGroup' }
      ]
    }

    const url = `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`

    const response = await axios.post(url, requestBody, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    const attributionData = {
      channels: [],
      totalConversions: 0,
      totalRevenue: 0
    }

    if (response.data.rows) {
      response.data.rows.forEach(row => {
        const channel = row.dimensionValues[0]?.value || 'Unknown'
        const conversions = parseFloat(row.metricValues[0]?.value || 0)
        const revenue = parseFloat(row.metricValues[1]?.value || 0)

        attributionData.channels.push({
          channel,
          conversions,
          revenue,
          contribution: 0 // Will be calculated
        })

        attributionData.totalConversions += conversions
        attributionData.totalRevenue += revenue
      })

      // Calculate contribution percentages
      attributionData.channels = attributionData.channels.map(channel => ({
        ...channel,
        conversionContribution: attributionData.totalConversions > 0 
          ? (channel.conversions / attributionData.totalConversions * 100).toFixed(2)
          : 0,
        revenueContribution: attributionData.totalRevenue > 0
          ? (channel.revenue / attributionData.totalRevenue * 100).toFixed(2)
          : 0
      }))
    }

    return response(true, 200, 'Attribution data fetched successfully', attributionData)
  } catch (error) {
    console.error('Error fetching attribution data:', error)
    return response(false, 500, error.message || 'Failed to fetch attribution data')
  }
}
