import { connectDB } from "@/lib/databaseConnection"
import { response } from "@/lib/helperFunction"
import { getRealTimeUsers, getRealTimeEvents } from "@/lib/ga4-reporting"

/**
 * Get real-time GA4 data
 */
export async function GET(request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'users'
    const limit = parseInt(searchParams.get('limit') || '20')

    if (type === 'users') {
      const users = await getRealTimeUsers()
      return response(true, 200, 'Real-time users fetched successfully', { activeUsers: users })
    } else if (type === 'events') {
      const events = await getRealTimeEvents(limit)
      return response(true, 200, 'Real-time events fetched successfully', events)
    }

    return response(false, 400, 'Invalid type parameter')
  } catch (error) {
    console.error('Error fetching real-time data:', error)
    return response(false, 500, error.message || 'Failed to fetch real-time data')
  }
}
