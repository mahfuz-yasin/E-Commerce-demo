import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import FacebookConfigModel from "@/models/FacebookConfig.model"
import axios from 'axios'

export async function POST(request) {
    try {
        await connectDB()

        const payload = await request.json()
        const { name, sourceAudienceId, country, ratio, description } = payload

        if (!name || !sourceAudienceId || !country || !ratio) {
            return response(false, 400, 'Missing required fields: name, sourceAudienceId, country, ratio')
        }

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
            // Create lookalike audience via Facebook Marketing API
            const audienceData = {
                name,
                description: description || `Lookalike audience created via Al Hilal Panjabi`,
                access_token: accessToken,
                source_audience_id: sourceAudienceId,
                country: country,
                ratio: ratio, // 1 for smallest, 10 for largest
                retention_days: 30
            }

            const response = await axios.post(
                `https://graph.facebook.com/${apiVersion}/${config.adAccountId}/customaudiences`,
                audienceData
            )

            const audience = response.data

            return response(true, 200, 'Lookalike audience created successfully.', audience)

        } catch (error) {
            console.error('Facebook API error:', error.response?.data || error.message)
            return response(false, 400, error.response?.data?.error?.message || 'Failed to create lookalike audience.')
        }

    } catch (error) {
        return catchError(error)
    }
}
