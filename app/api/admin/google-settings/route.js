import { connectDB } from "@/lib/databaseConnection"
import { response } from "@/lib/helperFunction"
import GoogleConfigModel from "@/models/GoogleConfig.model"

/**
 * Get Google settings
 */
export async function GET(request) {
  try {
    await connectDB()

    const config = await GoogleConfigModel.getConfig()
    
    return response(true, 200, 'Google settings retrieved successfully', config)
  } catch (error) {
    console.error('Error fetching Google settings:', error)
    return response(false, 500, error.message || 'Failed to fetch Google settings')
  }
}

/**
 * Save Google settings
 */
export async function POST(request) {
  try {
    await connectDB()

    const body = await request.json()

    const config = await GoogleConfigModel.getConfig()

    // Update only provided fields
    Object.keys(body).forEach(key => {
      if (config.schema.paths[key]) {
        config[key] = body[key]
      }
    })

    await config.save()

    return response(true, 200, 'Google settings saved successfully', config)
  } catch (error) {
    console.error('Error saving Google settings:', error)
    return response(false, 500, error.message || 'Failed to save Google settings')
  }
}
