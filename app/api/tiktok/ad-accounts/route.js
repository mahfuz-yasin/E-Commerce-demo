import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import TikTokConfigModel from "@/models/TikTokConfig.model"
import axios from 'axios'

const MAX_RETRIES = 3

/**
 * Make API request to TikTok with retry logic
 */
async function makeTikTokRequest(endpoint, accessToken, method = 'GET', data = null, retryCount = 0) {
  try {
    const apiVersion = 'v1.3'
    const url = `https://business-api.tiktok.com/open_api/${apiVersion}${endpoint}`
    
    const config = {
      headers: {
        'Access-Token': accessToken,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    }

    let response
    if (method === 'GET') {
      response = await axios.get(url, config)
    } else if (method === 'POST') {
      response = await axios.post(url, data, config)
    }

    return response.data
  } catch (error) {
    if (retryCount < MAX_RETRIES && error.response?.status === 429) {
      // Rate limited - exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000))
      return makeTikTokRequest(endpoint, accessToken, method, data, retryCount + 1)
    }
    throw error
  }
}

export async function GET(request) {
  try {
    await connectDB()

    const config = await TikTokConfigModel.getConfig()

    if (!config.accessToken || !config.businessCenterId) {
      return response(false, 400, 'Access Token and Business Center ID are required')
    }

    // Fetch ad accounts from TikTok Business Center
    const endpoint = `/bc/get/`
    const result = await makeTikTokRequest(endpoint, config.accessToken)

    if (!result || !result.data) {
      return response(false, 500, 'Failed to fetch ad accounts from TikTok')
    }

    // Filter ad accounts by business center ID
    const adAccounts = result.data.business_centers?.find(
      bc => bc.business_center_id === config.businessCenterId
    )?.ad_accounts || []

    return response(true, 200, 'Ad accounts retrieved successfully', adAccounts)
  } catch (error) {
    console.error('Error fetching TikTok ad accounts:', error)
    return catchError(error)
  }
}

export async function POST(request) {
  try {
    await connectDB()

    const body = await request.json()
    const { adAccountId } = body

    if (!adAccountId) {
      return response(false, 400, 'Ad Account ID is required')
    }

    const config = await TikTokConfigModel.getConfig()

    // Update selected ad account
    config.adAccountId = adAccountId
    await config.save()

    return response(true, 200, 'Ad account selected successfully', { adAccountId })
  } catch (error) {
    return catchError(error)
  }
}
