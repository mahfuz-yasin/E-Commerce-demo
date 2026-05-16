import { connectDB } from "@/lib/databaseConnection"
import { response } from "@/lib/helperFunction"
import { generateWeeklyReport, generateMonthlyReport, sendAnalyticsReport } from "@/lib/scheduled-reports"

/**
 * Generate and send scheduled report
 */
export async function POST(request) {
  try {
    await connectDB()

    const body = await request.json()
    const { type, recipientEmail } = body

    let reportResult

    if (type === 'weekly') {
      reportResult = await generateWeeklyReport()
    } else if (type === 'monthly') {
      reportResult = await generateMonthlyReport()
    } else {
      return response(false, 400, 'Invalid report type. Use "weekly" or "monthly"')
    }

    if (!reportResult.success) {
      return response(false, 500, reportResult.message)
    }

    // Send report via email
    const sendResult = await sendAnalyticsReport(reportResult.data, recipientEmail)

    if (!sendResult.success) {
      return response(false, 500, sendResult.message)
    }

    return response(true, 200, 'Report generated and sent successfully')
  } catch (error) {
    console.error('Error generating scheduled report:', error)
    return response(false, 500, error.message || 'Failed to generate scheduled report')
  }
}
