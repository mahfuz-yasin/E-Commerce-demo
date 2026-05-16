import { connectDB } from "@/lib/databaseConnection"
import { response } from "@/lib/helperFunction"
import CustomReportModel from "@/models/CustomReport.model"
import { fetchGA4Data } from "@/lib/ga4-reporting"

/**
 * Get custom report by ID
 */
export async function GET(request, { params }) {
  try {
    await connectDB()

    const report = await CustomReportModel.findById(params.id)

    if (!report) {
      return response(false, 404, 'Custom report not found')
    }

    return response(true, 200, 'Custom report fetched successfully', report)
  } catch (error) {
    console.error('Error fetching custom report:', error)
    return response(false, 500, error.message || 'Failed to fetch custom report')
  }
}

/**
 * Run custom report
 */
export async function POST(request, { params }) {
  try {
    await connectDB()

    const report = await CustomReportModel.findById(params.id)

    if (!report) {
      return response(false, 404, 'Custom report not found')
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate') || '30daysAgo'
    const endDate = searchParams.get('endDate') || 'today'

    const data = await fetchGA4Data(
      report.metrics,
      report.dimensions,
      startDate,
      endDate,
      report.filters
    )

    return response(true, 200, 'Report executed successfully', data)
  } catch (error) {
    console.error('Error running custom report:', error)
    return response(false, 500, error.message || 'Failed to run custom report')
  }
}

/**
 * Delete custom report
 */
export async function DELETE(request, { params }) {
  try {
    await connectDB()

    const report = await CustomReportModel.findByIdAndDelete(params.id)

    if (!report) {
      return response(false, 404, 'Custom report not found')
    }

    return response(true, 200, 'Custom report deleted successfully')
  } catch (error) {
    console.error('Error deleting custom report:', error)
    return response(false, 500, error.message || 'Failed to delete custom report')
  }
}
