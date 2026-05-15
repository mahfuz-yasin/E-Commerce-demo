import { isAuthenticated } from "@/lib/authentication"
import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import FacebookConfigModel from "@/models/FacebookConfig.model"
import { maskSensitiveData } from "@/lib/encryption"

export async function GET(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        
        const config = await FacebookConfigModel.getConfig()
        
        // Mask sensitive data for response
        const maskedConfig = {
            ...config.toObject(),
            appSecret: config.appSecret ? maskSensitiveData(config.appSecret) : '',
            capiAccessToken: config.capiAccessToken ? maskSensitiveData(config.capiAccessToken) : '',
            clientToken: config.clientToken ? maskSensitiveData(config.clientToken) : '',
            systemUserId: config.systemUserId ? maskSensitiveData(config.systemUserId) : ''
        }

        return response(true, 200, 'Facebook settings retrieved successfully.', maskedConfig)

    } catch (error) {
        return catchError(error)
    }
}

export async function POST(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        const payload = await request.json()

        const config = await FacebookConfigModel.getConfig()

        // Update fields
        const updatableFields = [
            'appId', 'appSecret', 'apiVersion',
            'pixelId', 'capiAccessToken', 'testEventCode', 'pixelStatus', 'capiStatus',
            'businessManagerId', 'adAccountId', 'businessManagerStatus',
            'pageId', 'messengerPageId', 'pageStatus', 'messengerStatus',
            'catalogId', 'catalogStatus',
            'instagramBusinessId', 'instagramStatus',
            'whatsappBusinessId', 'whatsappStatus',
            'domainVerificationCode', 'clientToken', 'systemUserId'
        ]

        updatableFields.forEach(field => {
            if (payload[field] !== undefined) {
                config[field] = payload[field]
            }
        })

        await config.save()

        // Return masked data
        const maskedConfig = {
            ...config.toObject(),
            appSecret: config.appSecret ? maskSensitiveData(config.appSecret) : '',
            capiAccessToken: config.capiAccessToken ? maskSensitiveData(config.capiAccessToken) : '',
            clientToken: config.clientToken ? maskSensitiveData(config.clientToken) : '',
            systemUserId: config.systemUserId ? maskSensitiveData(config.systemUserId) : ''
        }

        return response(true, 200, 'Facebook settings updated successfully.', maskedConfig)

    } catch (error) {
        return catchError(error)
    }
}
