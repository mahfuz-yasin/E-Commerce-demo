import { connectDB } from "@/lib/databaseConnection"
import { response } from "@/lib/helperFunction"
import { getGA4OverviewMetrics } from "@/lib/ga4-reporting"

/**
 * Get GA4 overview metrics
 */
export async function GET(request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate') || '30daysAgo'
    const endDate = searchParams.get('endDate') || 'today'

    const metrics = await getGA4OverviewMetrics(startDate, endDate)

    return response(true, 200, 'Overview metrics fetched successfully', metrics)
  } catch (error) {
    console.error('Error fetching overview metrics:', error)
    return response(false, 500, error.message || 'Failed to fetch overview metrics')
  }
}
