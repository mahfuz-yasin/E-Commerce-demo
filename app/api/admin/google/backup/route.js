import { connectDB } from "@/lib/databaseConnection"
import { response } from "@/lib/helperFunction"
import GoogleConfigModel from "@/models/GoogleConfig.model"
import { decrypt } from "@/lib/google-validation"

/**
 * Export all Google settings to JSON
 */
export async function GET(request) {
  try {
    await connectDB()

    const config = await GoogleConfigModel.getConfig()

    // Decrypt sensitive fields for export
    const exportData = {
      ga4MeasurementId: config.ga4MeasurementId || '',
      ga4ApiSecret: config.ga4ApiSecret || '',
      ga4PropertyId: config.ga4PropertyId || '',
      googleAdsCustomerId: config.googleAdsCustomerId || '',
      googleAdsDeveloperToken: config.googleAdsDeveloperToken || '',
      googleAdsRefreshToken: config.googleAdsRefreshToken || '',
      googleAdsClientId: config.googleAdsClientId || '',
      googleAdsClientSecret: config.googleAdsClientSecret || '',
      googleAdsTokenExpiry: config.googleAdsTokenExpiry || null,
      googleAdsConversions: config.googleAdsConversions || {},
      merchantCenterId: config.merchantCenterId || '',
      merchantCenterFeedId: config.merchantCenterFeedId || '',
      gtmContainerId: config.gtmContainerId || '',
      gtmAuth: config.gtmAuth || '',
      gtmPreview: config.gtmPreview || '',
      gtmVariables: config.gtmVariables || [],
      customTags: config.customTags || [],
      conversionLinkerActive: config.conversionLinkerActive || false,
      cloudinaryFolderForGoogleFeeds: config.cloudinaryFolderForGoogleFeeds || 'google-catalog',
      isGA4Active: config.isGA4Active || 'inactive',
      isGoogleAdsActive: config.isGoogleAdsActive || 'inactive',
      isMerchantActive: config.isMerchantActive || 'inactive',
      isGTMActive: config.isGTMActive || 'inactive',
      apiVersion: config.apiVersion || 'v1',
      exportedAt: new Date().toISOString(),
      version: '1.0'
    }

    return response(true, 200, 'Google settings exported successfully', exportData)
  } catch (error) {
    console.error('Error exporting Google settings:', error)
    return response(false, 500, error.message || 'Failed to export Google settings')
  }
}

/**
 * Import Google settings from JSON
 */
export async function POST(request) {
  try {
    await connectDB()

    const body = await request.json()
    const importData = body

    // Validate required fields
    if (!importData || typeof importData !== 'object') {
      return response(false, 400, 'Invalid import data')
    }

    // Get existing config
    const config = await GoogleConfigModel.getConfig()

    // Update config with imported data
    config.ga4MeasurementId = importData.ga4MeasurementId || ''
    config.ga4ApiSecret = importData.ga4ApiSecret || ''
    config.ga4PropertyId = importData.ga4PropertyId || ''
    config.googleAdsCustomerId = importData.googleAdsCustomerId || ''
    config.googleAdsDeveloperToken = importData.googleAdsDeveloperToken || ''
    config.googleAdsRefreshToken = importData.googleAdsRefreshToken || ''
    config.googleAdsClientId = importData.googleAdsClientId || ''
    config.googleAdsClientSecret = importData.googleAdsClientSecret || ''
    config.googleAdsTokenExpiry = importData.googleAdsTokenExpiry || null
    config.googleAdsConversions = importData.googleAdsConversions || {}
    config.merchantCenterId = importData.merchantCenterId || ''
    config.merchantCenterFeedId = importData.merchantCenterFeedId || ''
    config.gtmContainerId = importData.gtmContainerId || ''
    config.gtmAuth = importData.gtmAuth || ''
    config.gtmPreview = importData.gtmPreview || ''
    config.gtmVariables = importData.gtmVariables || []
    config.customTags = importData.customTags || []
    config.conversionLinkerActive = importData.conversionLinkerActive || false
    config.cloudinaryFolderForGoogleFeeds = importData.cloudinaryFolderForGoogleFeeds || 'google-catalog'
    config.isGA4Active = importData.isGA4Active || 'inactive'
    config.isGoogleAdsActive = importData.isGoogleAdsActive || 'inactive'
    config.isMerchantActive = importData.isMerchantActive || 'inactive'
    config.isGTMActive = importData.isGTMActive || 'inactive'
    config.apiVersion = importData.apiVersion || 'v1'

    await config.save()

    return response(true, 200, 'Google settings imported successfully', config)
  } catch (error) {
    console.error('Error importing Google settings:', error)
    return response(false, 500, error.message || 'Failed to import Google settings')
  }
}
