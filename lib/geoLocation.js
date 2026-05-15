/**
 * Geolocation and LDU (Limited Data Use) detection utilities
 */

// Countries with strict privacy laws (GDPR, CCPA, etc.)
const PRIVACY_RESTRICTED_COUNTRIES = [
  'US', // USA - CCPA
  'GB', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'SE', 'PL', // EU - GDPR
  'CA', // Canada - PIPEDA
  'AU', 'NZ', // Australia/New Zealand
  'JP', 'KR', 'SG', 'HK', // Asia-Pacific
  'BR', 'AR', 'CL', 'CO', 'MX', 'PE' // Latin America
]

/**
 * Detect if user is from a privacy-restricted country
 * @param {string} countryCode - ISO 3166-1 alpha-2 country code
 * @returns {boolean} True if restricted
 */
export function isPrivacyRestrictedCountry(countryCode) {
  if (!countryCode) return false
  return PRIVACY_RESTRICTED_COUNTRIES.includes(countryCode.toUpperCase())
}

/**
 * Get user's country code from IP (server-side)
 * @param {string} ipAddress - User's IP address
 * @returns {Promise<string|null>} Country code or null
 */
export async function getCountryFromIP(ipAddress) {
  try {
    if (!ipAddress) return null
    
    // Use a free IP geolocation service (ip-api.com or ipinfo.io)
    const response = await fetch(`http://ip-api.com/json/${ipAddress}?fields=countryCode`)
    const data = await response.json()
    
    return data.countryCode || null
  } catch (error) {
    console.error('Error detecting country from IP:', error)
    return null
  }
}

/**
 * Check if LDU should be enabled for the user
 * @param {string} countryCode - User's country code
 * @param {boolean} enableLDU - LDU setting from config
 * @returns {boolean} True if LDU should be enabled
 */
export function shouldEnableLDU(countryCode, enableLDU) {
  if (!enableLDU) return false
  return isPrivacyRestrictedCountry(countryCode)
}

/**
 * Get LDU configuration for Facebook Pixel
 * @param {string} countryCode - User's country code
 * @param {boolean} enableLDU - LDU setting from config
 * @returns {object} LDU configuration
 */
export function getLDUConfig(countryCode, enableLDU) {
  if (!shouldEnableLDU(countryCode, enableLDU)) {
    return null
  }

  return {
    dataProcessingOptions: ['LDU'],
    dataProcessingCountry: countryCode,
    dataProcessingState: '0'
  }
}
