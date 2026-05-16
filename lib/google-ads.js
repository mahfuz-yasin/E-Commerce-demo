import { connectDB } from "@/lib/databaseConnection"
import GoogleConfigModel from "@/models/GoogleConfig.model"
import { getGoogleAdsAccessToken } from "./google-auth"
import axios from "axios"
import crypto from "crypto"

/**
 * Hash data using SHA-256 for Enhanced Conversions
 * @param {string} data - Data to hash
 * @returns {string} SHA256 hash
 */
function hashSHA256(data) {
  if (!data) return ''
  const normalized = data.toString().toLowerCase().trim()
  return crypto.createHash('sha256').update(normalized).digest('hex')
}

/**
 * Send offline conversion to Google Ads
 * @param {string} customerId - Google Ads Customer ID (XXX-XXX-XXXX)
 * @param {string} conversionActionId - Conversion Action ID
 * @param {string} conversionDateTime - Conversion datetime (YYYY-MM-DD HH:MM:SS+00:00)
 * @param {number} conversionValue - Conversion value
 * @param {string} gclid - Google Click ID
 * @param {object} userData - User data for Enhanced Conversions (email, phone)
 * @returns {Promise} Response from Google Ads API
 */
export async function sendOfflineConversion(customerId, conversionActionId, conversionDateTime, conversionValue, gclid, userData = {}) {
  try {
    await connectDB()

    const config = await GoogleConfigModel.getConfig()

    if (config.isGoogleAdsActive !== 'active' || !config.googleAdsCustomerId) {
      console.warn('Google Ads not configured or inactive')
      return { success: false, message: 'Google Ads not configured or inactive' }
    }

    const accessToken = await getGoogleAdsAccessToken()

    // Prepare enhanced conversion data
    const enhancedConversionData = {}
    if (userData.email) {
      enhancedConversionData.hashed_email = hashSHA256(userData.email)
    }
    if (userData.phone) {
      enhancedConversionData.hashed_phone_number = hashSHA256(userData.phone)
    }
    if (userData.firstName) {
      enhancedConversionData.hashed_first_name = hashSHA256(userData.firstName)
    }
    if (userData.lastName) {
      enhancedConversionData.hashed_last_name = hashSHA256(userData.lastName)
    }
    if (userData.country) {
      enhancedConversionData.country_code = userData.country
    }
    if (userData.zipCode) {
      enhancedConversionData.postal_code = userData.zipCode
    }

    // Prepare conversion data
    const conversionData = {
      conversion_action: `customers/${customerId}/conversionActions/${conversionActionId}`,
      conversion_date_time: conversionDateTime,
      conversion_value: conversionValue,
      currency_code: 'BDT'
    }

    if (gclid) {
      conversionData.gclid = gclid
    }

    if (Object.keys(enhancedConversionData).length > 0) {
      conversionData.enhanced_conversion_data = enhancedConversionData
    }

    // Send to Google Ads API
    const url = `https://googleads.googleapis.com/v16/customers/${customerId}:uploadOfflineConversions`

    const response = await axios.post(url, {
      conversions: [conversionData]
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'developer-token': config.googleAdsDeveloperToken
      }
    })

    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error sending offline conversion:', error)
    return { success: false, message: error.message }
  }
}

/**
 * Upload click conversion to Google Ads
 * @param {string} customerId - Google Ads Customer ID (XXX-XXX-XXXX)
 * @param {string} conversionActionId - Conversion Action ID
 * @param {string} gclid - Google Click ID
 * @param {number} conversionValue - Conversion value
 * @param {string} conversionDateTime - Conversion datetime (YYYY-MM-DD HH:MM:SS+00:00)
 * @param {object} userData - User data for Enhanced Conversions
 * @returns {Promise} Response from Google Ads API
 */
export async function uploadClickConversion(customerId, conversionActionId, gclid, conversionValue, conversionDateTime, userData = {}) {
  try {
    await connectDB()

    const config = await GoogleConfigModel.getConfig()

    if (config.isGoogleAdsActive !== 'active' || !config.googleAdsCustomerId) {
      console.warn('Google Ads not configured or inactive')
      return { success: false, message: 'Google Ads not configured or inactive' }
    }

    const accessToken = await getGoogleAdsAccessToken()

    // Prepare enhanced conversion data
    const enhancedConversionData = {}
    if (userData.email) {
      enhancedConversionData.hashed_email = hashSHA256(userData.email)
    }
    if (userData.phone) {
      enhancedConversionData.hashed_phone_number = hashSHA256(userData.phone)
    }
    if (userData.firstName) {
      enhancedConversionData.hashed_first_name = hashSHA256(userData.firstName)
    }
    if (userData.lastName) {
      enhancedConversionData.hashed_last_name = hashSHA256(userData.lastName)
    }

    // Prepare click conversion data
    const clickConversionData = {
      conversion_action: `customers/${customerId}/conversionActions/${conversionActionId}`,
      gclid: gclid,
      conversion_value: conversionValue,
      conversion_date_time: conversionDateTime,
      currency_code: 'BDT'
    }

    if (Object.keys(enhancedConversionData).length > 0) {
      clickConversionData.enhanced_conversion_data = enhancedConversionData
    }

    // Send to Google Ads API
    const url = `https://googleads.googleapis.com/v16/customers/${customerId}:uploadClickConversions`

    const response = await axios.post(url, {
      click_conversions: [clickConversionData]
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'developer-token': config.googleAdsDeveloperToken
      }
    })

    return { success: true, data: response.data }
  } catch (error) {
    console.error('Error uploading click conversion:', error)
    return { success: false, message: error.message }
  }
}

/**
 * Fetch conversion actions from Google Ads
 * @returns {Promise} List of conversion actions
 */
export async function fetchConversionActions() {
  try {
    await connectDB()

    const config = await GoogleConfigModel.getConfig()

    if (config.isGoogleAdsActive !== 'active' || !config.googleAdsCustomerId) {
      console.warn('Google Ads not configured or inactive')
      return { success: false, message: 'Google Ads not configured or inactive' }
    }

    const accessToken = await getGoogleAdsAccessToken()

    // Query conversion actions
    const query = `
      SELECT
        conversion_action.id,
        conversion_action.name,
        conversion_action.status,
        conversion_action.type,
        conversion_action.category,
        conversion_action.counting_method,
        conversion_action.primary_for_goal
      FROM conversion_action
      WHERE conversion_action.status = 'ENABLED'
      ORDER BY conversion_action.name
    `

    const url = `https://googleads.googleapis.com/v16/customers/${config.googleAdsCustomerId}:searchStream`

    const response = await axios.post(url, {
      query: query
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'developer-token': config.googleAdsDeveloperToken
      }
    })

    const conversionActions = response.data.results || []

    return { success: true, data: conversionActions }
  } catch (error) {
    console.error('Error fetching conversion actions:', error)
    return { success: false, message: error.message }
  }
}
