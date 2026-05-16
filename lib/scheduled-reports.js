import { connectDB } from "@/lib/databaseConnection"
import GoogleConfigModel from "@/models/GoogleConfig.model"
import { getGA4OverviewMetrics, getEcommercePerformance, getTrafficAcquisition } from "@/lib/ga4-reporting"
import { sendMail } from "@/lib/sendMail"

/**
 * Generate weekly analytics report
 */
export async function generateWeeklyReport() {
  try {
    await connectDB()

    const config = await GoogleConfigModel.getConfig()

    if (config.isGA4Active !== 'active' || !config.ga4PropertyId) {
      console.log('GA4 not configured, skipping weekly report')
      return { success: false, message: 'GA4 not configured' }
    }

    const startDate = '7daysAgo'
    const endDate = 'today'

    const [overview, ecommerce, traffic] = await Promise.all([
      getGA4OverviewMetrics(startDate, endDate),
      getEcommercePerformance(startDate, endDate),
      getTrafficAcquisition(startDate, endDate)
    ])

    const reportData = {
      period: 'Last 7 days',
      overview,
      ecommerce,
      traffic: traffic.slice(0, 5),
      generatedAt: new Date().toISOString()
    }

    return { success: true, data: reportData }
  } catch (error) {
    console.error('Error generating weekly report:', error)
    return { success: false, message: error.message }
  }
}

/**
 * Generate monthly analytics report
 */
export async function generateMonthlyReport() {
  try {
    await connectDB()

    const config = await GoogleConfigModel.getConfig()

    if (config.isGA4Active !== 'active' || !config.ga4PropertyId) {
      console.log('GA4 not configured, skipping monthly report')
      return { success: false, message: 'GA4 not configured' }
    }

    const startDate = '30daysAgo'
    const endDate = 'today'

    const [overview, ecommerce, traffic] = await Promise.all([
      getGA4OverviewMetrics(startDate, endDate),
      getEcommercePerformance(startDate, endDate),
      getTrafficAcquisition(startDate, endDate)
    ])

    const reportData = {
      period: 'Last 30 days',
      overview,
      ecommerce,
      traffic: traffic.slice(0, 10),
      generatedAt: new Date().toISOString()
    }

    return { success: true, data: reportData }
  } catch (error) {
    console.error('Error generating monthly report:', error)
    return { success: false, message: error.message }
  }
}

/**
 * Send analytics report via email
 */
export async function sendAnalyticsReport(reportData, recipientEmail) {
  try {
    const htmlContent = generateReportHTML(reportData)

    const mailOptions = {
      to: recipientEmail,
      subject: `Analytics Report - ${reportData.period}`,
      html: htmlContent
    }

    await sendMail(mailOptions)

    return { success: true, message: 'Report sent successfully' }
  } catch (error) {
    console.error('Error sending analytics report:', error)
    return { success: false, message: error.message }
  }
}

/**
 * Generate HTML for email report
 */
function generateReportHTML(reportData) {
  const formatNumber = (num) => new Intl.NumberFormat('en-US').format(num || 0)
  const formatCurrency = (num) => new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT' }).format(num || 0)

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
        .metric { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #2563eb; }
        .metric-label { font-size: 12px; color: #6b7280; }
        .metric-value { font-size: 24px; font-weight: bold; color: #1f2937; }
        .table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        .table th, .table td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
        .table th { background: #f3f4f6; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Analytics Report</h1>
          <p>${reportData.period}</p>
          <p>Generated: ${new Date(reportData.generatedAt).toLocaleString()}</p>
        </div>
        <div class="content">
          <h2>Overview</h2>
          <div class="metric">
            <div class="metric-label">Active Users</div>
            <div class="metric-value">${formatNumber(reportData.overview.activeUsers)}</div>
          </div>
          <div class="metric">
            <div class="metric-label">Page Views</div>
            <div class="metric-value">${formatNumber(reportData.overview.screenPageViews)}</div>
          </div>
          <div class="metric">
            <div class="metric-label">Events</div>
            <div class="metric-value">${formatNumber(reportData.overview.eventCount)}</div>
          </div>
          
          <h2>Ecommerce Performance</h2>
          <div class="metric">
            <div class="metric-label">Total Revenue</div>
            <div class="metric-value">${formatCurrency(reportData.ecommerce.totalRevenue)}</div>
          </div>
          <div class="metric">
            <div class="metric-label">Purchasers</div>
            <div class="metric-value">${formatNumber(reportData.ecommerce.totalPurchasers)}</div>
          </div>
          <div class="metric">
            <div class="metric-label">Avg. Purchase Revenue</div>
            <div class="metric-value">${formatCurrency(reportData.ecommerce.averagePurchaseRevenue)}</div>
          </div>
          
          <h2>Top Traffic Sources</h2>
          <table class="table">
            <thead>
              <tr>
                <th>Source</th>
                <th>Medium</th>
                <th>Sessions</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.traffic.map(source => `
                <tr>
                  <td>${source.sessionSource || 'Direct'}</td>
                  <td>${source.sessionMedium || 'None'}</td>
                  <td>${formatNumber(source.sessions)}</td>
                  <td>${formatCurrency(source.totalRevenue)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </body>
    </html>
  `
}
