import { connectDB } from "@/lib/databaseConnection"
import { response } from "@/lib/helperFunction"
import GoogleConfigModel from "@/models/GoogleConfig.model"
import { NextResponse } from 'next/server'
import axios from 'axios'

/**
 * Google OAuth 2.0 Callback Handler
 * Exchanges authorization code for refresh token and access token
 */
export async function GET(request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/admin/google?error=${encodeURIComponent(error)}`)
    }

    if (!code) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/admin/google?error=missing_code`)
    }

    const config = await GoogleConfigModel.getConfig()

    // Exchange authorization code for tokens
    const tokenUrl = 'https://oauth2.googleapis.com/token'
    const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/google/oauth/callback`

    const tokenResponse = await axios.post(tokenUrl, {
      code: code,
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    })

    const tokenData = tokenResponse.data

    if (!tokenData.refresh_token) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/admin/google?error=no_refresh_token`)
    }

    // Store tokens in config
    config.googleAdsRefreshToken = tokenData.refresh_token
    config.googleAdsClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    config.googleAdsClientSecret = process.env.GOOGLE_CLIENT_SECRET
    config.googleAdsTokenExpiry = new Date(Date.now() + tokenData.expires_in * 1000)
    config.isGoogleAdsActive = 'active'

    await config.save()

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/admin/google?success=true`)
  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/admin/google?error=${encodeURIComponent(error.message)}`)
  }
}
