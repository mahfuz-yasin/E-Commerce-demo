import { connectDB } from "@/lib/databaseConnection"
import GoogleConfigModel from "@/models/GoogleConfig.model"
import axios from 'axios'

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'

/**
 * Refresh Google Ads access token using refresh token
 * @returns {Promise<object>} New token data
 */
export async function refreshGoogleAdsToken() {
  try {
    await connectDB()

    const config = await GoogleConfigModel.getConfig()

    if (!config.googleAdsRefreshToken) {
      throw new Error('Google Ads refresh token not configured')
    }

    const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/google/oauth/callback`

    const tokenResponse = await axios.post(GOOGLE_TOKEN_URL, {
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: config.googleAdsRefreshToken,
      grant_type: 'refresh_token',
      redirect_uri: redirectUri
    })

    const tokenData = tokenResponse.data

    // Update token expiry
    config.googleAdsTokenExpiry = new Date(Date.now() + tokenData.expires_in * 1000)
    await config.save()

    return {
      success: true,
      accessToken: tokenData.access_token,
      expiresIn: tokenData.expires_in
    }
  } catch (error) {
    console.error('Error refreshing Google Ads token:', error)
    return {
      success: false,
      message: error.message
    }
  }
}

/**
 * Get valid Google Ads access token (refresh if expired)
 * @returns {Promise<string>} Access token
 */
export async function getGoogleAdsAccessToken() {
  try {
    await connectDB()

    const config = await GoogleConfigModel.getConfig()

    if (!config.googleAdsRefreshToken) {
      throw new Error('Google Ads refresh token not configured')
    }

    // Check if token needs refresh
    if (config.googleAdsTokenExpiry && new Date(config.googleAdsTokenExpiry) < new Date()) {
      const result = await refreshGoogleAdsToken()
      if (!result.success) {
        throw new Error('Failed to refresh token')
      }
      return result.accessToken
    }

    // Get new access token
    const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/google/oauth/callback`
    const tokenResponse = await axios.post(GOOGLE_TOKEN_URL, {
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: config.googleAdsRefreshToken,
      grant_type: 'refresh_token',
      redirect_uri: redirectUri
    })

    return tokenResponse.data.access_token
  } catch (error) {
    console.error('Error getting Google Ads access token:', error)
    throw error
  }
}
