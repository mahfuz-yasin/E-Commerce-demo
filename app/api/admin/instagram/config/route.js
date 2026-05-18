import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import InstagramConfigModel from "@/models/InstagramConfig.model";

/**
 * GET /api/admin/instagram/config
 * Get Instagram configuration
 */
export async function GET(request) {
    try {
        await connectDB()

        const config = await InstagramConfigModel.findOne({ 
            deletedAt: null 
        }).select('-apiConfig.appSecret -businessAccount.accessToken -businessAccount.refreshToken -messaging.aiChatbot.apiKey').lean()

        if (!config) {
            return response(true, 200, 'No Instagram configuration found.', null)
        }

        return response(true, 200, 'Instagram configuration retrieved.', config)

    } catch (error) {
        console.error('[API Instagram Config GET] Error:', error)
        return catchError(error, 'Failed to retrieve Instagram configuration')
    }
}

/**
 * POST /api/admin/instagram/config
 * Create or update Instagram configuration
 */
export async function POST(request) {
    try {
        await connectDB()
        
        const body = await request.json()

        // Check if config already exists
        const existingConfig = await InstagramConfigModel.findOne({ deletedAt: null })

        let result
        if (existingConfig) {
            // Merge update with existing config
            result = await InstagramConfigModel.findByIdAndUpdate(
                existingConfig._id,
                { $set: body },
                { new: true, runValidators: true }
            )
            return response(true, 200, 'Instagram configuration updated successfully.', result)
        } else {
            // Create new config
            const newConfig = new InstagramConfigModel(body)
            result = await newConfig.save()
            return response(true, 201, 'Instagram configuration created successfully.', result)
        }

    } catch (error) {
        console.error('[API Instagram Config POST] Error:', error)
        return catchError(error, 'Failed to save Instagram configuration')
    }
}

/**
 * DELETE /api/admin/instagram/config
 * Delete Instagram configuration
 */
export async function DELETE(request) {
    try {
        await connectDB()

        const result = await InstagramConfigModel.findOneAndUpdate(
            { deletedAt: null },
            { deletedAt: new Date() },
            { new: true }
        )

        if (!result) {
            return response(false, 404, 'Instagram configuration not found.')
        }

        return response(true, 200, 'Instagram configuration deleted successfully.')

    } catch (error) {
        console.error('[API Instagram Config DELETE] Error:', error)
        return catchError(error, 'Failed to delete Instagram configuration')
    }
}
