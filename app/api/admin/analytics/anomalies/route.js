import { connectDB } from "@/lib/databaseConnection"
import { response } from "@/lib/helperFunction"
import { detectAnomalies, getAnomalySummary } from "@/lib/anomaly-detection"

/**
 * Get anomaly detection results
 */
export async function GET(request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'summary'

    if (type === 'summary') {
      const result = await getAnomalySummary()
      return response(true, 200, 'Anomaly summary fetched successfully', result.data)
    } else if (type === 'full') {
      const result = await detectAnomalies()
      return response(true, 200, 'Anomaly detection completed successfully', result.data)
    }

    return response(false, 400, 'Invalid type parameter')
  } catch (error) {
    console.error('Error detecting anomalies:', error)
    return response(false, 500, error.message || 'Failed to detect anomalies')
  }
}
