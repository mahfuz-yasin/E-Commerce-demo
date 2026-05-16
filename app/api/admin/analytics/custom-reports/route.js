import { connectDB } from "@/lib/databaseConnection"
import { response } from "@/lib/helperFunction"
import CustomReportModel from "@/models/CustomReport.model"
import { fetchGA4Data } from "@/lib/ga4-reporting"

/**
 * Get all custom reports
 */
export async function GET(request) {
  try {
    await connectDB()

    const reports = await CustomReportModel.find().sort({ createdAt: -1 })

    return response(true, 200, 'Custom reports fetched successfully', reports)
  } catch (error) {
    console.error('Error fetching custom reports:', error)
    return response(false, 500, error.message || 'Failed to fetch custom reports')
  }
}

/**
 * Create custom report
 */
export async function POST(request) {
  try {
    await connectDB()

    const body = await request.json()
    const { name, description, metrics, dimensions, filters, createdBy } = body

    const report = await CustomReportModel.create({
      name,
      description,
      metrics,
      dimensions,
      filters,
      createdBy
    })

    return response(true, 201, 'Custom report created successfully', report)
  } catch (error) {
    console.error('Error creating custom report:', error)
    return response(false, 500, error.message || 'Failed to create custom report')
  }
}
