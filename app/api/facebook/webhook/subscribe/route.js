import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import FacebookConfigModel from "@/models/FacebookConfig.model"
import axios from 'axios'

export async function POST(request) {
    try {
        await connectDB()

        const config = await FacebookConfigModel.getConfig()
        
        if (!config.appId || config.leadAdsStatus !== 'active') {
            return response(false, 400, 'Lead Ads is not enabled or App ID is not configured.')
        }

        if (!config.pageId) {
            return response(false, 400, 'Facebook Page ID is not configured.')
        }

        const apiVersion = config.apiVersion || 'v19.0'
        const accessToken = config.capiAccessToken

        if (!accessToken) {
            return response(false, 400, 'No access token available.')
        }

        try {
            // Subscribe to leadgen webhook for the page
            const response = await axios.post(
                `https://graph.facebook.com/${apiVersion}/${config.pageId}/subscribed_apps`,
                {
                    subscribed_fields: ['leadgen'],
                    access_token: accessToken
                }
            )

            if (response.data.success) {
                return response(true, 200, 'Webhook subscribed successfully.')
            } else {
                return response(false, 400, 'Failed to subscribe webhook.')
            }

        } catch (error) {
            console.error('Facebook API error:', error.response?.data || error.message)
            return response(false, 400, error.response?.data?.error?.message || 'Failed to subscribe webhook.')
        }

    } catch (error) {
        return catchError(error)
    }
}
