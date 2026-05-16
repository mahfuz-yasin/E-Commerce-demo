import { connectDB } from "@/lib/databaseConnection"
import { response } from "@/lib/helperFunction"
import GoogleConfigModel from "@/models/GoogleConfig.model"
import { getGA4AccessToken } from "@/lib/ga4-reporting"
import axios from 'axios'

/**
 * Export GA4 audiences to Google Ads
 */
export async function POST(request) {
  try {
    await connectDB()

    const body = await request.json()
    const { audienceName, audienceDefinition } = body

    const config = await GoogleConfigModel.getConfig()

    if (config.isGA4Active !== 'active' || !config.ga4PropertyId) {
      return response(false, 400, 'GA4 not configured or inactive')
    }

    if (config.isGTMActive !== 'active' || !config.gtmContainerId) {
      return response(false, 400, 'GTM not configured or inactive')
    }

    const accessToken = await getGA4AccessToken()
    const propertyId = config.ga4PropertyId

    // Create GA4 audience
    const audienceData = {
      displayName: audienceName,
      description: audienceDefinition.description || '',
      eventFilter: audienceDefinition.eventFilter || {},
      membershipDurationDays: audienceDefinition.membershipDurationDays || 30,
      exclusionDurationDays: audienceDefinition.exclusionDurationDays || 30
    }

    const url = `https://analyticsadmin.googleapis.com/v1beta/properties/${propertyId}/audiences`

    const response = await axios.post(url, audienceData, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    return response(true, 201, 'GA4 audience created successfully', response.data)
  } catch (error) {
    console.error('Error creating GA4 audience:', error)
    return response(false, 500, error.message || 'Failed to create GA4 audience')
  }
}

/**
 * Get all GA4 audiences
 */
export async function GET(request) {
  try {
    await connectDB()

    const config = await GoogleConfigModel.getConfig()

    if (config.isGA4Active !== 'active' || !config.ga4PropertyId) {
      return response(false, 400, 'GA4 not configured or inactive')
    }

    const accessToken = await getGA4AccessToken()
    const propertyId = config.ga4PropertyId

    const url = `https://analyticsadmin.googleapis.com/v1beta/properties/${propertyId}/audiences`

    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    return response(true, 200, 'GA4 audiences fetched successfully', response.data.audiences || [])
  } catch (error) {
    console.error('Error fetching GA4 audiences:', error)
    return response(false, 500, error.message || 'Failed to fetch GA4 audiences')
  }
}
