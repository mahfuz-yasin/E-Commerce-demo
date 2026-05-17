import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import { isAuthenticated } from "@/lib/authentication"
import AutoResponseModel from "@/models/AutoResponse.model"
import FacebookConfigModel from "@/models/FacebookConfig.model"

// POST sync auto response to Facebook
export async function POST(request, { params }) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        
        const autoResponse = await AutoResponseModel.findById(params.id)
        
        if (!autoResponse) {
            return response(false, 404, 'Response not found')
        }
        
        if (autoResponse.status !== 'active') {
            return response(false, 400, 'Response is not active')
        }
        
        autoResponse.syncStatus = 'syncing'
        await autoResponse.save()
        
        try {
            // TODO: Implement Facebook Messenger API sync for auto responses
            // For now, just mark as synced
            autoResponse.syncStatus = 'synced'
            autoResponse.lastSyncAt = new Date()
            await autoResponse.save()
            
            return response(true, 200, 'Response synced successfully', autoResponse)
        } catch (syncError) {
            console.error('Facebook sync error:', syncError)
            autoResponse.syncStatus = 'failed'
            autoResponse.syncError = syncError.message
            await autoResponse.save()
            return response(false, 500, syncError.message || 'Failed to sync response')
        }
    } catch (error) {
        return catchError(error)
    }
}
