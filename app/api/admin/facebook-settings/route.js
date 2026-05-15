import { isAuthenticated } from "@/lib/authentication"
import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import FacebookConfigModel from "@/models/FacebookConfig.model"
import { maskSensitiveData } from "@/lib/encryption"
import { validatePattern } from "@/lib/validation"

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

        // Validate inputs
        if (payload.appId && !validatePattern(payload.appId, 'appId')) {
            return response(false, 400, 'Invalid App ID format')
        }
        if (payload.pixelId && !validatePattern(payload.pixelId, 'pixelId')) {
            return response(false, 400, 'Invalid Pixel ID format')
        }
        if (payload.pageId && !validatePattern(payload.pageId, 'pageId')) {
            return response(false, 400, 'Invalid Page ID format')
        }
        if (payload.businessManagerId && !validatePattern(payload.businessManagerId, 'businessManagerId')) {
            return response(false, 400, 'Invalid Business Manager ID format')
        }
        if (payload.adAccountId && !validatePattern(payload.adAccountId, 'adAccountId')) {
            return response(false, 400, 'Invalid Ad Account ID format')
        }
        if (payload.catalogId && !validatePattern(payload.catalogId, 'catalogId')) {
            return response(false, 400, 'Invalid Catalog ID format')
        }
        if (payload.accessToken && !validatePattern(payload.accessToken, 'accessToken')) {
            return response(false, 400, 'Invalid Access Token format')
        }

        // Update fields
        const updatableFields = [
            'appId', 'appSecret', 'apiVersion',
            'pixelId', 'capiAccessToken', 'testEventCode', 'pixelStatus', 'capiStatus',
            'businessManagerId', 'adAccountId', 'businessManagerStatus',
            'pageId', 'messengerPageId', 'pageStatus', 'messengerStatus',
            'catalogId', 'catalogStatus',
            'instagramBusinessId', 'instagramStatus',
            'whatsappBusinessId', 'whatsappStatus',
            'domainVerificationCode', 'clientToken', 'systemUserId',
            'leadAdsStatus', 'autoReplyStatus', 'autoReplyMessage',
            'promotionStatus', 'promotionBannerText', 'promotionDiscountPercentage',
            'promotionDiscountCode', 'promotionCookieExpiration'
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
