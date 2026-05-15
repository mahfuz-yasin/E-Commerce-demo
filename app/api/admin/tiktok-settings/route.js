import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import TikTokConfigModel from "@/models/TikTokConfig.model"

export async function GET(request) {
    try {
        await connectDB()

        const config = await TikTokConfigModel.getConfig()

        // Mask sensitive data for GET response
        const maskedConfig = {
            ...config.toObject(),
            accessToken: config.accessToken ? '••••••••••••' : '',
            refreshToken: config.refreshToken ? '••••••••••••' : '',
            appSecret: config.appSecret ? '••••••••••••' : '',
            webhookSecret: config.webhookSecret ? '••••••••••••' : '',
            webhookVerifyToken: config.webhookVerifyToken ? '••••••••••••' : ''
        }

        return response(true, 200, 'TikTok settings retrieved successfully', maskedConfig)
    } catch (error) {
        return catchError(error)
    }
}

export async function POST(request) {
    try {
        await connectDB()

        const body = await request.json()
        const config = await TikTokConfigModel.getConfig()

        // Update only provided fields
        const updateData = {}
        const allowedFields = [
            'pixelId', 'accessToken', 'refreshToken', 'tokenExpiry',
            'businessCenterId', 'adAccountId', 'appId', 'appSecret',
            'catalogId', 'catalogFeedUrl', 'offlineEventSetId',
            'webhookSecret', 'webhookVerifyToken',
            'isPixelActive', 'isCAPIActive', 'isCatalogActive',
            'apiVersion'
        ]

        allowedFields.forEach(field => {
            if (body[field] !== undefined) {
                updateData[field] = body[field]
            }
        })

        Object.assign(config, updateData)
        await config.save()

        return response(true, 200, 'TikTok settings updated successfully', config)
    } catch (error) {
        return catchError(error)
    }
}
