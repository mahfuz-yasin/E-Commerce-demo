import { connectDB } from "@/lib/databaseConnection"
import { response } from "@/lib/helperFunction"
import GoogleConfigModel from "@/models/GoogleConfig.model"
import { sendOfflineConversion } from "@/lib/google-ads"

/**
 * Upload offline conversion to Google Ads
 */
export async function POST(request) {
  try {
    await connectDB()

    const body = await request.json()
    const { conversionType, conversionValue, gclid, userData } = body

    const config = await GoogleConfigModel.getConfig()

    if (config.isGoogleAdsActive !== 'active' || !config.googleAdsCustomerId) {
      return response(false, 400, 'Google Ads not configured or inactive')
    }

    // Get conversion action ID based on type
    const conversionActionId = config.googleAdsConversions?.[conversionType]
    if (!conversionActionId) {
      return response(false, 400, `No conversion action configured for ${conversionType}`)
    }

    // Format conversion datetime
    const conversionDateTime = new Date().toISOString().replace('T', ' ').substring(0, 19) + '+00:00'

    // Send offline conversion
    const result = await sendOfflineConversion(
      config.googleAdsCustomerId,
      conversionActionId,
      conversionDateTime,
      conversionValue,
      gclid,
      userData
    )

    if (!result.success) {
      return response(false, 500, result.message)
    }

    return response(true, 200, 'Offline conversion uploaded successfully', result.data)
  } catch (error) {
    console.error('Error uploading offline conversion:', error)
    return response(false, 500, error.message || 'Failed to upload offline conversion')
  }
}
