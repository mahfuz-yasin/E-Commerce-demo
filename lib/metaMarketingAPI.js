import axios from 'axios'
import FacebookConfigModel from '@/models/FacebookConfig.model'

// Rate limit tracking
let rateLimitInfo = {
    callCount: 0,
    windowStart: Date.now(),
    maxCalls: 200, // Default Meta API rate limit per hour
    windowDuration: 3600000 // 1 hour in milliseconds
}

/**
 * Check if we're within rate limits
 * @returns {boolean} True if we can make a request
 */
function checkRateLimit() {
    const now = Date.now()
    
    // Reset window if expired
    if (now - rateLimitInfo.windowStart > rateLimitInfo.windowDuration) {
        rateLimitInfo.callCount = 0
        rateLimitInfo.windowStart = now
    }
    
    return rateLimitInfo.callCount < rateLimitInfo.maxCalls
}

/**
 * Wait for rate limit to reset
 * @param {number} retryCount - Current retry attempt
 * @returns {Promise<void>}
 */
async function waitForRateLimit(retryCount = 0) {
    const now = Date.now()
    const timeUntilReset = rateLimitInfo.windowStart + rateLimitInfo.windowDuration - now
    
    if (timeUntilReset > 0) {
        console.log(`Rate limit reached. Waiting ${Math.ceil(timeUntilReset / 1000)} seconds...`)
        await new Promise(resolve => setTimeout(resolve, timeUntilReset))
    } else {
        // Exponential backoff
        const backoffTime = Math.min(Math.pow(2, retryCount) * 1000, 60000) // Max 60 seconds
        console.log(`Backing off for ${backoffTime}ms (attempt ${retryCount})`)
        await new Promise(resolve => setTimeout(resolve, backoffTime))
    }
}

/**
 * Make a request to Meta Marketing API with rate limit handling
 * @param {string} endpoint - API endpoint
 * @param {string} method - HTTP method
 * @param {object} data - Request data
 * @param {number} retryCount - Current retry attempt
 * @returns {Promise<object>} API response
 */
export async function metaAPIRequest(endpoint, method = 'GET', data = null, retryCount = 0) {
    const MAX_RETRIES = 5
    
    try {
        const config = await FacebookConfigModel.getConfig()
        
        if (!config.adAccountAccessToken || !config.adAccountId || !config.adCampaignManagerEnabled) {
            throw new Error('Ad Campaign Manager not configured')
        }

        const apiVersion = config.apiVersion || 'v21.0'
        const accessToken = config.adAccountAccessToken
        const adAccountId = config.adAccountId

        // Check rate limit
        if (!checkRateLimit()) {
            await waitForRateLimit(retryCount)
            return metaAPIRequest(endpoint, method, data, retryCount + 1)
        }

        // Increment call count
        rateLimitInfo.callCount++

        const url = `https://graph.facebook.com/${apiVersion}/${endpoint}`
        const headers = {
            'Content-Type': 'application/json'
        }

        let response
        if (method === 'GET') {
            response = await axios.get(url, {
                headers,
                params: { access_token: accessToken, ...data }
            })
        } else if (method === 'POST') {
            response = await axios.post(url, data, {
                headers,
                params: { access_token: accessToken }
            })
        } else if (method === 'DELETE') {
            response = await axios.delete(url, {
                headers,
                params: { access_token: accessToken }
            })
        }

        // Update rate limit info from response headers if available
        if (response.headers['x-business-use-case-usage']) {
            const usage = JSON.parse(response.headers['x-business-use-case-usage'])
            // Meta provides rate limit info in headers
            console.log('Meta API Usage:', usage)
        }

        return response.data

    } catch (error) {
        // Handle rate limit errors
        if (error.response?.status === 429) {
            const retryAfter = error.response.headers['retry-after'] || 60
            console.log(`Rate limited by Meta. Retrying after ${retryAfter} seconds...`)
            await new Promise(resolve => setTimeout(resolve, retryAfter * 1000))
            
            if (retryCount < MAX_RETRIES) {
                return metaAPIRequest(endpoint, method, data, retryCount + 1)
            }
        }

        // Handle other errors with exponential backoff
        if (retryCount < MAX_RETRIES) {
            const backoffTime = Math.min(Math.pow(2, retryCount) * 1000, 60000)
            console.log(`API request failed (attempt ${retryCount + 1}). Retrying in ${backoffTime}ms...`)
            await new Promise(resolve => setTimeout(resolve, backoffTime))
            return metaAPIRequest(endpoint, method, data, retryCount + 1)
        }

        throw error
    }
}

/**
 * Get all campaigns for the ad account
 * @param {object} filters - Optional filters (status, etc.)
 * @returns {Promise<object>} Campaigns data
 */
export async function getCampaigns(filters = {}) {
    const fields = [
        'id',
        'name',
        'status',
        'objective',
        'daily_budget',
        'lifetime_budget',
        'start_time',
        'stop_time',
        'created_time',
        'updated_time',
        'effective_status'
    ].join(',')

    const params = {
        fields,
        ...filters
    }

    return metaAPIRequest(`act_${config.adAccountId}/campaigns`, 'GET', params)
}

/**
 * Update campaign status (activate/pause)
 * @param {string} campaignId - Campaign ID
 * @param {string} status - New status (ACTIVE, PAUSED)
 * @returns {Promise<object>} Updated campaign data
 */
export async function updateCampaignStatus(campaignId, status) {
    return metaAPIRequest(campaignId, 'POST', {
        status: status.toUpperCase()
    })
}

/**
 * Update campaign budget
 * @param {string} campaignId - Campaign ID
 * @param {object} budgetData - Budget data (daily_budget or lifetime_budget)
 * @returns {Promise<object>} Updated campaign data
 */
export async function updateCampaignBudget(campaignId, budgetData) {
    return metaAPIRequest(campaignId, 'POST', budgetData)
}

/**
 * Get ad sets for a campaign
 * @param {string} campaignId - Campaign ID
 * @returns {Promise<object>} Ad sets data
 */
export async function getAdSets(campaignId) {
    const fields = [
        'id',
        'name',
        'status',
        'daily_budget',
        'lifetime_budget',
        'start_time',
        'end_time',
        'targeting',
        'optimization_goal',
        'billing_event'
    ].join(',')

    return metaAPIRequest(`${campaignId}/adsets`, 'GET', { fields })
}

/**
 * Get ads for an ad set
 * @param {string} adSetId - Ad set ID
 * @returns {Promise<object>} Ads data
 */
export async function getAds(adSetId) {
    const fields = [
        'id',
        'name',
        'status',
        'creative',
        'tracking_specs',
        'created_time',
        'updated_time'
    ].join(',')

    return metaAPIRequest(`${adSetId}/ads`, 'GET', { fields })
}

/**
 * Get insights for campaigns, ad sets, or ads
 * @param {string} id - Campaign, ad set, or ad ID
 * @param {object} params - Insight parameters (date_preset, fields, etc.)
 * @returns {Promise<object>} Insights data
 */
export async function getInsights(id, params = {}) {
    const defaultFields = [
        'impressions',
        'clicks',
        'spend',
        'cpc',
        'ctr',
        'conversions',
        'purchase_roas',
        'actions',
        'action_values'
    ].join(',')

    const queryParams = {
        fields: defaultFields,
        date_preset: params.date_preset || 'last_7d',
        ...params
    }

    return metaAPIRequest(`${id}/insights`, 'GET', queryParams)
}

/**
 * Update ad creative
 * @param {string} creativeId - Creative ID
 * @param {object} creativeData - Creative data (image_url, etc.)
 * @returns {Promise<object>} Updated creative data
 */
export async function updateCreative(creativeId, creativeData) {
    return metaAPIRequest(creativeId, 'POST', creativeData)
}
