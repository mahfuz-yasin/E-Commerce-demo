import { connectDB } from "@/lib/databaseConnection"
import { response } from "@/lib/helperFunction"
import { getEcommercePerformance, getTopProducts } from "@/lib/ga4-reporting"

/**
 * Get ecommerce performance data
 */
export async function GET(request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate') || '30daysAgo'
    const endDate = searchParams.get('endDate') || 'today'
    const type = searchParams.get('type') || 'overview'

    if (type === 'overview') {
      const metrics = await getEcommercePerformance(startDate, endDate)
      return response(true, 200, 'Ecommerce performance fetched successfully', metrics)
    } else if (type === 'products') {
      const products = await getTopProducts(startDate, endDate, 10)
      return response(true, 200, 'Top products fetched successfully', products)
    }

    return response(false, 400, 'Invalid type parameter')
  } catch (error) {
    console.error('Error fetching ecommerce data:', error)
    return response(false, 500, error.message || 'Failed to fetch ecommerce data')
  }
}
