import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import { isAuthenticated } from "@/lib/authentication"
import AttributionModelModel from "@/models/AttributionModel.model"

// GET all attribution models
export async function GET(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        
        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')
        const modelType = searchParams.get('modelType')
        const adAccountId = searchParams.get('adAccountId')
        
        let query = {}
        if (status) {
            query.status = status
        }
        if (modelType) {
            query.modelType = modelType
        }
        if (adAccountId) {
            query.adAccountId = adAccountId
        }
        
        const models = await AttributionModelModel.find(query)
            .sort({ createdAt: -1 })
            .lean()

        return response(true, 200, 'Attribution models fetched successfully', models)
    } catch (error) {
        return catchError(error)
    }
}

// POST create new attribution model
export async function POST(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        const payload = await request.json()
        
        // Validate required fields
        if (!payload.modelName || !payload.modelType || !payload.adAccountId) {
            return response(false, 400, 'Missing required fields: modelName, modelType, adAccountId')
        }
        
        // Validate model type specific fields
        if (payload.modelType === 'first_click' && !payload.firstClickConfig) {
            return response(false, 400, 'firstClickConfig are required for first_click model')
        }
        if (payload.modelType === 'last_click' && !payload.lastClickConfig) {
            return response(false, 400, 'lastClickConfig are required for last_click model')
        }
        if (payload.modelType === 'linear' && !payload.linearConfig) {
            return response(false, 400, 'linearConfig are required for linear model')
        }
        if (payload.modelType === 'time_decay' && !payload.timeDecayConfig) {
            return response(false, 400, 'timeDecayConfig are required for time_decay model')
        }
        if (payload.modelType === 'position_based' && !payload.positionBasedConfig) {
            return response(false, 400, 'positionBasedConfig are required for position_based model')
        }
        if (payload.modelType === 'custom' && !payload.customConfig) {
            return response(false, 400, 'customConfig are required for custom model')
        }
        
        // If this is set as default, remove default from other models for this account
        if (payload.isDefault) {
            await AttributionModelModel.updateMany(
                { adAccountId: payload.adAccountId, isDefault: true },
                { isDefault: false }
            )
        }
        
        // Set created by
        payload.createdBy = auth.user?.id || 'system'
        
        // Create attribution model
        const model = await AttributionModelModel.create(payload)
        
        return response(true, 201, 'Attribution model created successfully', model)
    } catch (error) {
        return catchError(error)
    }
}
