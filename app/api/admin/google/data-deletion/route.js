import { connectDB } from "@/lib/databaseConnection"
import { response } from "@/lib/helperFunction"
import GoogleConfigModel from "@/models/GoogleConfig.model"
import { getGA4AccessToken } from "@/lib/ga4-reporting"
import axios from 'axios'

/**
 * Request data deletion from Google APIs
 */
export async function POST(request) {
  try {
    await connectDB()

    const body = await request.json()
    const { userId, email } = body

    if (!userId && !email) {
      return response(false, 400, 'User ID or email is required')
    }

    const config = await GoogleConfigModel.getConfig()
    const deletionResults = []

    // GA4 Data Deletion Request
    if (config.isGA4Active === 'active' && config.ga4PropertyId) {
      try {
        const accessToken = await getGA4AccessToken()
        
        const url = `https://analyticsadmin.googleapis.com/v1beta/properties/${config.ga4PropertyId}/dataDeletionRequests`
        
        const requestBody = {
          deleteRequest: {
            deleteDaysSpan: {
              startDate: '2020-01-01',
              endDate: new Date().toISOString().split('T')[0]
            },
            deletableUserIds: [
              userId || email
            ]
          }
        }

        const response = await axios.post(url, requestBody, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        })

        deletionResults.push({
          platform: 'GA4',
          status: 'success',
          requestId: response.data.name
        })
      } catch (error) {
        deletionResults.push({
          platform: 'GA4',
          status: 'error',
          error: error.message
        })
      }
    }

    // Google Ads Data Deletion (via API)
    if (config.isGoogleAdsActive === 'active' && config.googleAdsCustomerId) {
      try {
        const accessToken = await getGA4AccessToken()
        
        // Note: Google Ads doesn't have a direct data deletion API
        // This would need to be handled through the Google Ads UI or via customer match
        deletionResults.push({
          platform: 'Google Ads',
          status: 'info',
          message: 'Data deletion must be done through Google Ads UI or Customer Match API'
        })
      } catch (error) {
        deletionResults.push({
          platform: 'Google Ads',
          status: 'error',
          error: error.message
        })
      }
    }

    // Merchant Center Data Deletion
    if (config.isMerchantActive === 'active' && config.merchantCenterId) {
      try {
        // Merchant Center doesn't have a direct data deletion API for user data
        deletionResults.push({
          platform: 'Merchant Center',
          status: 'info',
          message: 'User data deletion not applicable for Merchant Center'
        })
      } catch (error) {
        deletionResults.push({
          platform: 'Merchant Center',
          status: 'error',
          error: error.message
        })
      }
    }

    return response(true, 200, 'Data deletion request processed', {
      userId,
      email,
      deletionResults,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error processing data deletion request:', error)
    return response(false, 500, error.message || 'Failed to process data deletion request')
  }
}
