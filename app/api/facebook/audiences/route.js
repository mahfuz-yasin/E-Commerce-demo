import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import FacebookConfigModel from "@/models/FacebookConfig.model"
import axios from 'axios'

export async function GET(request) {
    try {
        await connectDB()

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
            // Fetch custom audiences from Facebook Marketing API
            const response = await axios.get(
                `https://graph.facebook.com/${apiVersion}/${config.adAccountId}/customaudiences`,
                {
                    params: {
                        access_token: accessToken,
                        fields: 'id,name,description,subtype,approximate_count_lower_bound,approximate_count_upper_bound,time_created,time_updated,retention_days'
                    }
                }
            )

            const audiences = response.data.data || []

            return response(true, 200, 'Audiences retrieved successfully.', audiences)

        } catch (error) {
            console.error('Facebook API error:', error.response?.data || error.message)
            return response(false, 400, error.response?.data?.error?.message || 'Failed to fetch audiences from Facebook.')
        }

    } catch (error) {
        return catchError(error)
    }
}

export async function POST(request) {
    try {
        await connectDB()

        const payload = await request.json()
        const { name, type, subtype, rules, description } = payload

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
            // Create custom audience via Facebook Marketing API
            let audienceData = {
                name,
                description: description || `Custom audience created via Al Hilal Panjabi`,
                access_token: accessToken
            }

            // Add type-specific parameters
            if (type === 'website') {
                audienceData.subtype = 'WEBSITE'
                audienceData.ruleset = {
                    inclusion_rules: rules || [
                        {
                            operator: 'or',
                            rules: [
                                {
                                    field: 'url',
                                    operator: 'i_contains',
                                    value: '/'
                                }
                            ]
                        }
                    ]
                }
                audienceData.retention_days = 30
            } else if (type === 'engagement') {
                audienceData.subtype = 'ENGAGEMENT'
                audienceData.ruleset = {
                    inclusion_rules: rules || [
                        {
                            operator: 'or',
                            rules: [
                                {
                                    event: {
                                        type: 'video',
                                        retention_seconds: 2592000
                                    }
                                }
                            ]
                        }
                    ]
                }
                audienceData.retention_days = 30
            }

            const response = await axios.post(
                `https://graph.facebook.com/${apiVersion}/${config.adAccountId}/customaudiences`,
                audienceData
            )

            const audience = response.data

            return response(true, 200, 'Custom audience created successfully.', audience)

        } catch (error) {
            console.error('Facebook API error:', error.response?.data || error.message)
            return response(false, 400, error.response?.data?.error?.message || 'Failed to create custom audience.')
        }

    } catch (error) {
        return catchError(error)
    }
}
