import TikTokConfigModel from "@/models/TikTokConfig.model"
import { connectDB } from "@/lib/databaseConnection"
import axios from 'axios'

const TikTok_API_BASE_URL = 'https://business-api.tiktok.com/open_api/'
const MAX_RETRIES = 3

/**
 * Refresh TikTok access token using refresh token
 * @returns {Promise<object>} New access token data
 */
export async function refreshTikTokToken() {
  try {
    await connectDB()

    const config = await TikTokConfigModel.getConfig()

    if (!config.refreshToken) {
      throw new Error('Refresh token not available')
    }

    const tokenUrl = 'https://business-api.tiktok.com/open_api/oauth2/refresh_token/'
    const tokenData = {
      app_id: config.appId,
      secret: config.appSecret,
      refresh_token: config.refreshToken
    }

    const tokenResponse = await axios.post(tokenUrl, tokenData, {
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const tokenDataResponse = tokenResponse.data

    if (!tokenDataResponse.data || !tokenDataResponse.data.access_token) {
      throw new Error('Failed to refresh access token')
    }

    // Update TikTok config with new tokens
    config.accessToken = tokenDataResponse.data.access_token
    config.refreshToken = tokenDataResponse.data.refresh_token
    config.tokenExpiry = new Date(Date.now() + (tokenDataResponse.data.expires_in * 1000))
    await config.save()

    return {
      success: true,
      accessToken: config.accessToken,
      tokenExpiry: config.tokenExpiry
    }
  } catch (error) {
    console.error('Error refreshing TikTok token:', error)
    throw error
  }
}

/**
 * Get valid access token (refresh if expired)
 * @returns {Promise<string>} Valid access token
 */
export async function getValidAccessToken() {
  await connectDB()

  const config = await TikTokConfigModel.getConfig()

  // Check if token is expired or will expire within 5 minutes
  const now = new Date()
  const tokenExpiry = config.tokenExpiry ? new Date(config.tokenExpiry) : null
  const isExpired = !tokenExpiry || tokenExpiry <= new Date(now.getTime() + 5 * 60 * 1000)

  if (isExpired && config.refreshToken) {
    console.log('Token expired or expiring soon, refreshing...')
    const refreshed = await refreshTikTokToken()
    return refreshed.accessToken
  }

  if (!config.accessToken) {
    throw new Error('Access token not available')
  }

  return config.accessToken
}

/**
 * Make authenticated request to TikTok API
 * @param {string} endpoint - API endpoint
 * @param {object} options - Request options
 * @returns {Promise<object>} API response
 */
export async function makeTikTokRequest(endpoint, options = {}) {
  const accessToken = await getValidAccessToken()
  const apiVersion = 'v1.3'
  const url = `https://business-api.tiktok.com/open_api/${apiVersion}${endpoint}`

  const config = {
    headers: {
      'Access-Token': accessToken,
      'Content-Type': 'application/json'
    },
    ...options
  }

  try {
    const response = await axios(url, config)
    return response.data
  } catch (error) {
    // If 401 unauthorized, try refreshing token once
    if (error.response?.status === 401) {
      console.log('Token expired, refreshing and retrying...')
      const newAccessToken = await refreshTikTokToken()
      config.headers['Access-Token'] = newAccessToken.accessToken
      const retryResponse = await axios(url, config)
      return retryResponse.data
    }
    throw error
  }
}
