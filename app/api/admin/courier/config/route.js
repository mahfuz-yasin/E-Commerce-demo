import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import CourierConfigModel from "@/models/CourierConfig.model";

/**
 * GET /api/admin/courier/config
 * Get all courier configurations (excluding sensitive data)
 */
export async function GET(request) {
    try {
        await connectDB()

        const configs = await CourierConfigModel.find({ deletedAt: null })
            .select('-apiConfig.secretKey') // Exclude secret key from list
            .sort({ courierName: 1 })
            .lean()

        return response(true, 200, 'Courier configurations retrieved.', configs)

    } catch (error) {
        console.error('[API Courier Config GET] Error:', error)
        return catchError(error, 'Failed to retrieve courier configurations')
    }
}

/**
 * POST /api/admin/courier/config
 * Create or update courier configuration
 */
export async function POST(request) {
    try {
        await connectDB()
        
        const body = await request.json()
        const { 
            courierName, 
            displayName, 
            isActive, 
            apiConfig, 
            settings 
        } = body

        if (!courierName || !displayName || !apiConfig?.baseUrl || !apiConfig?.apiKey) {
            return response(false, 400, 'Courier name, display name, API URL and API key are required.')
        }

        // Check if courier config already exists
        const existingConfig = await CourierConfigModel.findOne({ 
            courierName,
            deletedAt: null 
        })

        let result
        if (existingConfig) {
            // Update existing
            result = await CourierConfigModel.findByIdAndUpdate(
                existingConfig._id,
                {
                    displayName,
                    isActive: isActive ?? existingConfig.isActive,
                    'apiConfig.baseUrl': apiConfig.baseUrl,
                    'apiConfig.apiKey': apiConfig.apiKey,
                    'apiConfig.secretKey': apiConfig.secretKey || existingConfig.apiConfig.secretKey,
                    'apiConfig.additionalConfig': apiConfig.additionalConfig || {},
                    'settings.autoAssign': settings?.autoAssign ?? existingConfig.settings.autoAssign,
                    'settings.defaultCodAmount': settings?.defaultCodAmount || 'full',
                    'settings.customCodAmount': settings?.customCodAmount || 0,
                    'settings.webhookUrl': settings?.webhookUrl || null
                },
                { new: true }
            )
            return response(true, 200, 'Courier configuration updated successfully.', result)
        } else {
            // Create new
            const newConfig = new CourierConfigModel({
                courierName,
                displayName,
                isActive: isActive ?? false,
                apiConfig: {
                    baseUrl: apiConfig.baseUrl,
                    apiKey: apiConfig.apiKey,
                    secretKey: apiConfig.secretKey || null,
                    additionalConfig: apiConfig.additionalConfig || {}
                },
                settings: {
                    autoAssign: settings?.autoAssign ?? false,
                    defaultCodAmount: settings?.defaultCodAmount || 'full',
                    customCodAmount: settings?.customCodAmount || 0,
                    webhookUrl: settings?.webhookUrl || null
                }
            })
            result = await newConfig.save()
            return response(true, 201, 'Courier configuration created successfully.', result)
        }

    } catch (error) {
        console.error('[API Courier Config POST] Error:', error)
        return catchError(error, 'Failed to save courier configuration')
    }
}
