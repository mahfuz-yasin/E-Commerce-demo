import { connectDB } from "@/lib/databaseConnection"
import { response } from "@/lib/helperFunction"
import { fetchConversionActions } from "@/lib/google-ads"

/**
 * Fetch Google Ads conversion actions
 */
export async function GET(request) {
  try {
    await connectDB()

    const result = await fetchConversionActions()

    if (!result.success) {
      return response(false, 500, result.message)
    }

    return response(true, 200, 'Conversion actions fetched successfully', result.data)
  } catch (error) {
    console.error('Error fetching conversion actions:', error)
    return response(false, 500, error.message || 'Failed to fetch conversion actions')
  }
}
