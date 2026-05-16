import { connectDB } from "@/lib/databaseConnection"
import GoogleConfigModel from "@/models/GoogleConfig.model"
import axios from 'axios'

/**
 * Get GA4 Data API access token using OAuth
 */
export async function getGA4AccessToken() {
  try {
    await connectDB()
    const config = await GoogleConfigModel.getConfig()

    if (config.isGA4Active !== 'active' || !config.ga4PropertyId) {
      throw new Error('GA4 not configured or inactive')
    }

    // Use OAuth refresh token
    if (config.googleAdsRefreshToken) {
      const response = await axios.post('https://oauth2.googleapis.com/token', {
        client_id: config.googleAdsClientId,
        client_secret: config.googleAdsClientSecret,
        refresh_token: config.googleAdsRefreshToken,
        grant_type: 'refresh_token'
      })

      return response.data.access_token
    }

    throw new Error('OAuth refresh token not configured for GA4 Data API')
  } catch (error) {
    console.error('Error getting GA4 access token:', error)
    throw error
  }
}

/**
 * Fetch data from GA4 Data API v1
 * @param {Array} metrics - Array of metric names
 * @param {Array} dimensions - Array of dimension names
 * @param {string} startDate - Start date (YYYY-MM-DD or relative like '30daysAgo')
 * @param {string} endDate - End date (YYYY-MM-DD or 'today')
 * @param {Object} filters - Dimension filters
 * @returns {Promise} GA4 data response
 */
export async function fetchGA4Data(metrics, dimensions = [], startDate = '30daysAgo', endDate = 'today', filters = {}) {
  try {
    await connectDB()
    const config = await GoogleConfigModel.getConfig()

    if (config.isGA4Active !== 'active' || !config.ga4PropertyId) {
      throw new Error('GA4 not configured or inactive')
    }

    const accessToken = await getGA4AccessToken()
    const propertyId = config.ga4PropertyId

    // Build request body
    const requestBody = {
      dateRanges: [
        {
          startDate,
          endDate
        }
      ],
      metrics: metrics.map(metric => ({ name: metric }))
    }

    if (dimensions.length > 0) {
      requestBody.dimensions = dimensions.map(dimension => ({ name: dimension }))
    }

    if (Object.keys(filters).length > 0) {
      requestBody.dimensionFilter = {
        filter: {
          fieldName: Object.keys(filters)[0],
          stringFilter: {
            matchType: 'EXACT',
            value: Object.values(filters)[0]
          }
        }
      }
    }

    const url = `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`

    const response = await axios.post(url, requestBody, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    return parseGA4Response(response.data)
  } catch (error) {
    console.error('Error fetching GA4 data:', error)
    throw error
  }
}

/**
 * Fetch real-time data from GA4
 * @param {Array} metrics - Array of metric names
 * @param {Array} dimensions - Array of dimension names
 * @param {number} minutesAgo - Number of minutes ago to fetch data
 */
export async function fetchGA4RealTimeData(metrics, dimensions = [], minutesAgo = 30) {
  try {
    await connectDB()
    const config = await GoogleConfigModel.getConfig()

    if (config.isGA4Active !== 'active' || !config.ga4PropertyId) {
      throw new Error('GA4 not configured or inactive')
    }

    const accessToken = await getGA4AccessToken()
    const propertyId = config.ga4PropertyId

    const requestBody = {
      metrics: metrics.map(metric => ({ name: metric }))
    }

    if (dimensions.length > 0) {
      requestBody.dimensions = dimensions.map(dimension => ({ name: dimension }))
    }

    const url = `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runRealtimeReport`

    const response = await axios.post(url, requestBody, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    return parseGA4Response(response.data)
  } catch (error) {
    console.error('Error fetching GA4 real-time data:', error)
    throw error
  }
}

/**
 * Parse GA4 API response
 */
function parseGA4Response(data) {
  const result = {
    rows: [],
    totals: {},
    rowCount: data.rowCount || 0
  }

  if (data.metricTotals) {
    data.metricTotals.forEach((metric, index) => {
      result.totals[data.metrics[index].name] = metric.value
    })
  }

  if (data.rows) {
    result.rows = data.rows.map(row => {
      const rowObj = {}
      
      if (row.dimensionValues) {
        data.dimensions.forEach((dimension, index) => {
          rowObj[dimension.name] = row.dimensionValues[index]?.value || ''
        })
      }

      if (row.metricValues) {
        data.metrics.forEach((metric, index) => {
          rowObj[metric.name] = row.metricValues[index]?.value || '0'
        })
      }

      return rowObj
    })
  }

  return result
}

/**
 * Get overview metrics
 */
export async function getGA4OverviewMetrics(startDate = '30daysAgo', endDate = 'today') {
  const metrics = [
    'activeUsers',
    'screenPageViews',
    'eventCount',
    'sessions',
    'totalRevenue',
    'totalPurchasers',
    'averagePurchaseRevenue'
  ]

  const data = await fetchGA4Data(metrics, [], startDate, endDate)
  return data.totals
}

/**
 * Get traffic acquisition data
 */
export async function getTrafficAcquisition(startDate = '30daysAgo', endDate = 'today') {
  const metrics = ['sessions', 'activeUsers', 'totalRevenue']
  const dimensions = ['sessionSource', 'sessionMedium']

  const data = await fetchGA4Data(metrics, dimensions, startDate, endDate)
  return data.rows
}

/**
 * Get top pages by page views
 */
export async function getTopPages(startDate = '30daysAgo', endDate = 'today', limit = 10) {
  const metrics = ['screenPageViews', 'activeUsers', 'averageSessionDuration']
  const dimensions = ['pageTitle', 'pagePath']

  const data = await fetchGA4Data(metrics, dimensions, startDate, endDate)
  return data.rows.slice(0, limit)
}

/**
 * Get top events
 */
export async function getTopEvents(startDate = '30daysAgo', endDate = 'today', limit = 10) {
  const metrics = ['eventCount', 'totalUsers']
  const dimensions = ['eventName']

  const data = await fetchGA4Data(metrics, dimensions, startDate, endDate)
  return data.rows.slice(0, limit)
}

/**
 * Get ecommerce performance
 */
export async function getEcommercePerformance(startDate = '30daysAgo', endDate = 'today') {
  const metrics = ['totalRevenue', 'totalPurchasers', 'averagePurchaseRevenue', 'itemRevenue']
  const dimensions = []

  const data = await fetchGA4Data(metrics, dimensions, startDate, endDate)
  return data.totals
}

/**
 * Get top products by revenue
 */
export async function getTopProducts(startDate = '30daysAgo', endDate = 'today', limit = 10) {
  const metrics = ['totalRevenue', 'itemRevenue', 'itemQuantity']
  const dimensions = ['itemName', 'itemCategory']

  const data = await fetchGA4Data(metrics, dimensions, startDate, endDate)
  return data.rows.slice(0, limit)
}

/**
 * Get real-time users
 */
export async function getRealTimeUsers() {
  const metrics = ['activeUsers']
  const data = await fetchGA4RealTimeData(metrics)
  return data.totals.activeUsers
}

/**
 * Get real-time events
 */
export async function getRealTimeEvents(limit = 20) {
  const metrics = ['eventCount']
  const dimensions = ['eventName', 'eventName', 'minutesAgo']

  const data = await fetchGA4RealTimeData(metrics, dimensions)
  return data.rows.slice(0, limit)
}
