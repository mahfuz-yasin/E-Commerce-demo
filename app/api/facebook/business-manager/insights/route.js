import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import FacebookConfigModel from "@/models/FacebookConfig.model"
import axios from 'axios'

export async function GET(request) {
    try {
        await connectDB()

        const { searchParams } = new URL(request.url)
        const datePreset = searchParams.get('date_preset') || 'last_30d'
        const fields = searchParams.get('fields') || 'spend,impressions,clicks,cpc,ctr'

        const config = await FacebookConfigModel.getConfig()
        
        if (!config.adAccountId || config.businessManagerStatus !== 'active') {
            return response(false, 400, 'Ad account is not configured or Business Manager is inactive.')
        }

        const apiVersion = config.apiVersion || 'v19.0'
        const accessToken = config.capiAccessToken

        if (!accessToken) {
            return response(false, 400, 'No access token available.')
        }

        try {
            // Fetch insights from Facebook Marketing API
            const response = await axios.get(
                `https://graph.facebook.com/${apiVersion}/${config.adAccountId}/insights`,
                {
                    params: {
                        access_token: accessToken,
                        date_preset: datePreset,
                        fields: fields,
                        level: 'account'
                    }
                }
            )

            const insights = response.data.data || []
            const summary = response.data.summary || {}

            return response(true, 200, 'Ad account insights retrieved successfully.', {
                insights,
                summary,
                datePreset,
                fields
            })

        } catch (error) {
            console.error('Facebook API error:', error.response?.data || error.message)
            return response(false, 400, error.response?.data?.error?.message || 'Failed to fetch ad account insights.')
        }

    } catch (error) {
        return catchError(error)
    }
}
