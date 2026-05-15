import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import FacebookConfigModel from "@/models/FacebookConfig.model"
import axios from 'axios'

export async function POST(request) {
    try {
        await connectDB()

        const config = await FacebookConfigModel.getConfig()
        
        if (!config.appId || !config.appSecret) {
            return response(false, 400, 'App ID and App Secret are required for token refresh')
        }

        // Exchange short-lived token for long-lived token
        try {
            const response = await axios.get(
                `https://graph.facebook.com/oauth/access_token`,
                {
                    params: {
                        grant_type: 'fb_exchange_token',
                        client_id: config.appId,
                        client_secret: config.appSecret,
                        fb_exchange_token: config.capiAccessToken
                    }
                }
            )

            const newAccessToken = response.data.access_token

            // Update the config with new token
            config.capiAccessToken = newAccessToken
            await config.save()

            return response(true, 200, 'Token refreshed successfully.', { expiresIn: response.data.expires_in })

        } catch (error) {
            console.error('Facebook API error:', error.response?.data || error.message)
            return response(false, 400, error.response?.data?.error?.message || 'Failed to refresh token')
        }

    } catch (error) {
        return catchError(error)
    }
}
