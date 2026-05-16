import { connectDB } from "@/lib/databaseConnection"
import ProductModel from "@/models/Product.model"
import { response } from "@/lib/helperFunction"
import GoogleConfigModel from "@/models/GoogleConfig.model"

/**
 * Get Merchant Feed Status
 */
export async function GET(request) {
  try {
    await connectDB()

    const config = await GoogleConfigModel.getConfig()

    if (!config.isMerchantActive || config.isMerchantActive !== 'active') {
      return response(false, 400, 'Merchant Center not active')
    }

    const productCount = await ProductModel.countDocuments({ status: 'active' })

    const feedStatus = {
      productCount,
      lastSyncTime: new Date(),
      status: 'active',
      feedUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/google/merchant/feed`,
      supplementalFeedUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/google/merchant/supplemental`
    }

    return response(true, 200, 'Feed status retrieved successfully', feedStatus)
  } catch (error) {
    console.error('Error fetching feed status:', error)
    return response(false, 500, error.message || 'Failed to fetch feed status')
  }
}
