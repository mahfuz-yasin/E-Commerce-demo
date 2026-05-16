import { connectDB } from "@/lib/databaseConnection"
import GoogleConfigModel from "@/models/GoogleConfig.model"
import { getGA4OverviewMetrics, getEcommercePerformance } from "@/lib/ga4-reporting"

/**
 * Detect anomalies in analytics data
 * Compares current period with historical data
 */
export async function detectAnomalies() {
  try {
    await connectDB()

    const config = await GoogleConfigModel.getConfig()

    if (config.isGA4Active !== 'active' || !config.ga4PropertyId) {
      console.log('GA4 not configured, skipping anomaly detection')
      return { success: false, message: 'GA4 not configured' }
    }

    // Get current data (last 7 days)
    const currentMetrics = await getGA4OverviewMetrics('7daysAgo', 'today')
    const currentEcommerce = await getEcommercePerformance('7daysAgo', 'today')

    // Get historical data (previous 7 days)
    const historicalMetrics = await getGA4OverviewMetrics('14daysAgo', '8daysAgo')
    const historicalEcommerce = await getEcommercePerformance('14daysAgo', '8daysAgo')

    const anomalies = []

    // Revenue anomaly detection (drop more than 20%)
    if (currentEcommerce.totalRevenue < historicalEcommerce.totalRevenue * 0.8) {
      const dropPercentage = ((historicalEcommerce.totalRevenue - currentEcommerce.totalRevenue) / historicalEcommerce.totalRevenue * 100).toFixed(2)
      anomalies.push({
        type: 'revenue_drop',
        severity: 'high',
        message: `Revenue dropped by ${dropPercentage}% compared to previous period`,
        currentValue: currentEcommerce.totalRevenue,
        historicalValue: historicalEcommerce.totalRevenue
      })
    }

    // User drop anomaly detection (drop more than 15%)
    if (currentMetrics.activeUsers < historicalMetrics.activeUsers * 0.85) {
      const dropPercentage = ((historicalMetrics.activeUsers - currentMetrics.activeUsers) / historicalMetrics.activeUsers * 100).toFixed(2)
      anomalies.push({
        type: 'user_drop',
        severity: 'medium',
        message: `Active users dropped by ${dropPercentage}% compared to previous period`,
        currentValue: currentMetrics.activeUsers,
        historicalValue: historicalMetrics.activeUsers
      })
    }

    // Page views drop anomaly detection (drop more than 15%)
    if (currentMetrics.screenPageViews < historicalMetrics.screenPageViews * 0.85) {
      const dropPercentage = ((historicalMetrics.screenPageViews - currentMetrics.screenPageViews) / historicalMetrics.screenPageViews * 100).toFixed(2)
      anomalies.push({
        type: 'page_view_drop',
        severity: 'medium',
        message: `Page views dropped by ${dropPercentage}% compared to previous period`,
        currentValue: currentMetrics.screenPageViews,
        historicalValue: historicalMetrics.screenPageViews
      })
    }

    // Positive anomaly detection (revenue increase more than 50%)
    if (currentEcommerce.totalRevenue > historicalEcommerce.totalRevenue * 1.5) {
      const increasePercentage = ((currentEcommerce.totalRevenue - historicalEcommerce.totalRevenue) / historicalEcommerce.totalRevenue * 100).toFixed(2)
      anomalies.push({
        type: 'revenue_surge',
        severity: 'info',
        message: `Revenue increased by ${increasePercentage}% compared to previous period`,
        currentValue: currentEcommerce.totalRevenue,
        historicalValue: historicalEcommerce.totalRevenue
      })
    }

    return {
      success: true,
      data: {
        anomalies,
        currentMetrics,
        historicalMetrics,
        currentEcommerce,
        historicalEcommerce,
        detectedAt: new Date().toISOString()
      }
    }
  } catch (error) {
    console.error('Error detecting anomalies:', error)
    return { success: false, message: error.message }
  }
}

/**
 * Get anomaly alert summary
 */
export async function getAnomalySummary() {
  try {
    const result = await detectAnomalies()

    if (!result.success) {
      return result
    }

    const data = result.data || {}
    const anomalies = data.anomalies || []

    const summary = {
      totalAnomalies: anomalies.length,
      highSeverity: anomalies.filter(a => a.severity === 'high').length,
      mediumSeverity: anomalies.filter(a => a.severity === 'medium').length,
      infoSeverity: anomalies.filter(a => a.severity === 'info').length,
      anomalies: anomalies
    }

    return { success: true, data: summary }
  } catch (error) {
    console.error('Error getting anomaly summary:', error)
    return { success: false, message: error.message }
  }
}
