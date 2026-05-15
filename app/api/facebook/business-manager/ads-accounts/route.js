import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import FacebookConfigModel from "@/models/FacebookConfig.model"
import axios from 'axios'

export async function GET(request) {
    try {
        await connectDB()

        const config = await FacebookConfigModel.getConfig()
        
        if (!config.appId || !config.appSecret || !config.systemUserId || config.businessManagerStatus !== 'active') {
            return response(false, 400, 'Business Manager is not configured or inactive.')
        }

        // Get access token using system user
        const apiVersion = config.apiVersion || 'v19.0'
        
        try {
            // Get a system user access token (in production, you'd need to implement proper token generation)
            // For now, we'll use the capiAccessToken if available
            const accessToken = config.capiAccessToken

            if (!accessToken) {
                return response(false, 400, 'No access token available. Please configure CAPI Access Token.')
            }

            // Fetch ad accounts from Facebook Marketing API
            const response = await axios.get(
                `https://graph.facebook.com/${apiVersion}/me/adaccounts`,
                {
                    params: {
                        access_token: accessToken,
                        fields: 'id,name,account_status,currency,timezone_name'
                    }
                }
            )

            const adAccounts = response.data.data || []

            return response(true, 200, 'Ad accounts retrieved successfully.', adAccounts)

        } catch (error) {
            console.error('Facebook API error:', error.response?.data || error.message)
            return response(false, 400, error.response?.data?.error?.message || 'Failed to fetch ad accounts from Facebook.')
        }

    } catch (error) {
        return catchError(error)
    }
}
