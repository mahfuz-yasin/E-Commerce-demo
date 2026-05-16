import { connectDB } from "@/lib/databaseConnection"
import { response } from "@/lib/helperFunction"
import { getTopEvents } from "@/lib/ga4-reporting"

/**
 * Get top events
 */
export async function GET(request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate') || '30daysAgo'
    const endDate = searchParams.get('endDate') || 'today'
    const limit = parseInt(searchParams.get('limit') || '10')

    const events = await getTopEvents(startDate, endDate, limit)

    return response(true, 200, 'Top events fetched successfully', events)
  } catch (error) {
    console.error('Error fetching top events:', error)
    return response(false, 500, error.message || 'Failed to fetch top events')
  }
}
