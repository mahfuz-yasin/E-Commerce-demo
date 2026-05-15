import { response } from "@/lib/helperFunction"
import TikTokConfigModel from "@/models/TikTokConfig.model"
import { connectDB } from "@/lib/databaseConnection"

export async function GET(request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const redirectUri = searchParams.get('redirect_uri') || `${process.env.NEXT_PUBLIC_BASE_URL}/api/tiktok/auth/callback`

    const config = await TikTokConfigModel.getConfig()

    if (!config.appId) {
      return response(false, 400, 'TikTok App ID is not configured')
    }

    // TikTok OAuth scopes
    const scopes = [
      'advertiser_info',
      'campaign_management',
      'adgroup_management',
      'ad_management',
      'reporting',
      'dpa_management'
    ]

    const state = Buffer.from(JSON.stringify({
      timestamp: Date.now(),
      redirect_uri: redirectUri
    })).toString('base64')

    // TikTok OAuth URL
    const authUrl = `https://business-api.tiktok.com/open_api/oauth2/authorize/` +
      `?app_id=${config.appId}` +
      `&scope=${encodeURIComponent(scopes.join(','))}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&state=${state}` +
      `&response_type=code`

    return response(true, 200, 'OAuth URL generated successfully', { authUrl })
  } catch (error) {
    console.error('Error generating OAuth URL:', error)
    return response(false, 500, 'Failed to generate OAuth URL')
  }
}
