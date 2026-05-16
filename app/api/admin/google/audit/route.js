import { connectDB } from "@/lib/databaseConnection"
import { response } from "@/lib/helperFunction"
import GoogleConfigModel from "@/models/GoogleConfig.model"
import { validateGA4MeasurementId, validateGoogleAdsCustomerId, validateGTMContainerId, validateMerchantCenterId } from "@/lib/google-validation"
import { getGA4AccessToken } from "@/lib/ga4-reporting"
import axios from 'axios'

/**
 * Run full Google integration diagnostic
 */
export async function POST(request) {
  try {
    await connectDB()

    const config = await GoogleConfigModel.getConfig()

    const auditResults = {
      timestamp: new Date().toISOString(),
      ga4: {
        status: 'not_configured',
        issues: [],
        lastApiCall: null
      },
      googleAds: {
        status: 'not_configured',
        issues: [],
        lastApiCall: null
      },
      merchantCenter: {
        status: 'not_configured',
        issues: [],
        lastApiCall: null
      },
      gtm: {
        status: 'not_configured',
        issues: [],
        lastApiCall: null
      },
      conversionLinker: {
        status: 'inactive',
        issues: []
      }
    }

    // GA4 Audit
    if (config.ga4MeasurementId) {
      if (!validateGA4MeasurementId(config.ga4MeasurementId)) {
        auditResults.ga4.issues.push('Invalid GA4 Measurement ID format. Expected: G-XXXXXXXXX')
      } else {
        auditResults.ga4.status = 'configured'
        
        // Test GA4 API connection
        try {
          const accessToken = await getGA4AccessToken()
          auditResults.ga4.lastApiCall = new Date().toISOString()
          auditResults.ga4.status = 'active'
        } catch (error) {
          auditResults.ga4.issues.push('Failed to connect to GA4 API: ' + error.message)
          auditResults.ga4.status = 'error'
        }
      }
    }

    // Google Ads Audit
    if (config.googleAdsCustomerId) {
      if (!validateGoogleAdsCustomerId(config.googleAdsCustomerId)) {
        auditResults.googleAds.issues.push('Invalid Google Ads Customer ID format. Expected: 123-456-7890')
      } else {
        auditResults.googleAds.status = 'configured'
        
        // Check if access token is valid
        if (config.googleAdsRefreshToken) {
          try {
            const response = await axios.post('https://oauth2.googleapis.com/token', {
              client_id: config.googleAdsClientId,
              client_secret: config.googleAdsClientSecret,
              refresh_token: config.googleAdsRefreshToken,
              grant_type: 'refresh_token'
            })
            auditResults.googleAds.lastApiCall = new Date().toISOString()
            auditResults.googleAds.status = 'active'
          } catch (error) {
            auditResults.googleAds.issues.push('Failed to refresh Google Ads access token: ' + error.message)
            auditResults.googleAds.status = 'error'
          }
        } else {
          auditResults.googleAds.issues.push('No refresh token configured')
        }
      }
    }

    // Merchant Center Audit
    if (config.merchantCenterId) {
      if (!validateMerchantCenterId(config.merchantCenterId)) {
        auditResults.merchantCenter.issues.push('Invalid Merchant Center ID format. Expected: 12-digit number')
      } else {
        auditResults.merchantCenter.status = 'configured'
        
        // Check feed accessibility
        try {
          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://alhilalpanjabi.com'
          const feedUrl = `${baseUrl}/api/google/merchant/feed`
          const response = await axios.get(feedUrl)
          auditResults.merchantCenter.lastApiCall = new Date().toISOString()
          auditResults.merchantCenter.status = 'active'
        } catch (error) {
          auditResults.merchantCenter.issues.push('Feed endpoint not accessible: ' + error.message)
          auditResults.merchantCenter.status = 'error'
        }
      }
    }

    // GTM Audit
    if (config.gtmContainerId) {
      if (!validateGTMContainerId(config.gtmContainerId)) {
        auditResults.gtm.issues.push('Invalid GTM Container ID format. Expected: GTM-XXXXXXX')
      } else {
        auditResults.gtm.status = 'configured'
        
        // Check if preview mode is active
        if (config.gtmAuth && config.gtmPreview) {
          auditResults.gtm.status = 'preview_mode'
        } else {
          auditResults.gtm.status = 'active'
        }
      }
    }

    // Conversion Linker Audit
    if (config.conversionLinkerActive) {
      auditResults.conversionLinker.status = 'active'
    } else {
      auditResults.conversionLinker.issues.push('Conversion linker is not active')
    }

    return response(true, 200, 'Audit completed successfully', auditResults)
  } catch (error) {
    console.error('Error running audit:', error)
    return response(false, 500, error.message || 'Failed to run audit')
  }
}
