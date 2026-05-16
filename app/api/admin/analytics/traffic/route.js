import { connectDB } from "@/lib/databaseConnection"
import { response } from "@/lib/helperFunction"
import { getTrafficAcquisition } from "@/lib/ga4-reporting"

/**
 * Get traffic acquisition data
 */
export async function GET(request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate') || '30daysAgo'
    const endDate = searchParams.get('endDate') || 'today'

    const data = await getTrafficAcquisition(startDate, endDate)

    return response(true, 200, 'Traffic acquisition data fetched successfully', data)
  } catch (error) {
    console.error('Error fetching traffic acquisition data:', error)
    return response(false, 500, error.message || 'Failed to fetch traffic acquisition data')
  }
}
