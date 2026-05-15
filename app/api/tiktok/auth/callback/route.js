import { connectDB } from "@/lib/databaseConnection"
import { response } from "@/lib/helperFunction"
import TikTokConfigModel from "@/models/TikTokConfig.model"
import axios from 'axios'

export async function GET(request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')

    if (error) {
      return response(false, 400, errorDescription || 'OAuth error occurred')
    }

    if (!code) {
      return response(false, 400, 'Authorization code is missing')
    }

    // Verify state if needed
    let redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/tiktok/auth/callback`
    if (state) {
      try {
        const stateData = JSON.parse(Buffer.from(state, 'base64').toString())
        redirectUri = stateData.redirect_uri || redirectUri
      } catch (e) {
        console.error('Error parsing state:', e)
      }
    }

    const config = await TikTokConfigModel.getConfig()

    if (!config.appId || !config.appSecret) {
      return response(false, 400, 'TikTok App ID and Secret are required')
    }

    // Exchange authorization code for access token
    const tokenUrl = 'https://business-api.tiktok.com/open_api/oauth2/access_token/'
    const tokenData = {
      app_id: config.appId,
      secret: config.appSecret,
      auth_code: code
    }

    const tokenResponse = await axios.post(tokenUrl, tokenData, {
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const tokenDataResponse = tokenResponse.data

    if (!tokenDataResponse.data || !tokenDataResponse.data.access_token) {
      return response(false, 500, 'Failed to exchange authorization code for access token')
    }

    // Update TikTok config with tokens
    config.accessToken = tokenDataResponse.data.access_token
    config.refreshToken = tokenDataResponse.data.refresh_token
    config.tokenExpiry = new Date(Date.now() + (tokenDataResponse.data.expires_in * 1000))
    await config.save()

    return response(true, 200, 'OAuth authentication successful', {
      accessToken: '••••••••••••',
      tokenExpiry: config.tokenExpiry
    })
  } catch (error) {
    console.error('Error in OAuth callback:', error)
    return response(false, 500, 'Failed to complete OAuth authentication')
  }
}
