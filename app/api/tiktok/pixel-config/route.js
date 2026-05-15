import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import TikTokConfigModel from "@/models/TikTokConfig.model"

export async function GET(request) {
    try {
        await connectDB()

        const config = await TikTokConfigModel.getConfig()

        if (!config.pixelId || config.isPixelActive !== 'active') {
            return response(true, 200, 'TikTok Pixel not configured or inactive', { pixelId: null })
        }

        return response(true, 200, 'TikTok Pixel config retrieved successfully', { pixelId: config.pixelId })
    } catch (error) {
        return catchError(error)
    }
}
