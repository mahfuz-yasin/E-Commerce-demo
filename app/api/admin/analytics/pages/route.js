import { connectDB } from "@/lib/databaseConnection"
import { response } from "@/lib/helperFunction"
import { getTopPages } from "@/lib/ga4-reporting"

/**
 * Get top pages by page views
 */
export async function GET(request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate') || '30daysAgo'
    const endDate = searchParams.get('endDate') || 'today'
    const limit = parseInt(searchParams.get('limit') || '10')

    const pages = await getTopPages(startDate, endDate, limit)

    return response(true, 200, 'Top pages fetched successfully', pages)
  } catch (error) {
    console.error('Error fetching top pages:', error)
    return response(false, 500, error.message || 'Failed to fetch top pages')
  }
}
