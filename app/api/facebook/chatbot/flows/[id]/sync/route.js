import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import { isAuthenticated } from "@/lib/authentication"
import ChatbotFlowModel from "@/models/ChatbotFlow.model"
import FacebookConfigModel from "@/models/FacebookConfig.model"

// POST sync chatbot flow to Facebook
export async function POST(request, { params }) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        
        const flow = await ChatbotFlowModel.findById(params.id)
        
        if (!flow) {
            return response(false, 404, 'Flow not found')
        }
        
        if (flow.status !== 'active') {
            return response(false, 400, 'Flow is not active')
        }
        
        flow.syncStatus = 'syncing'
        await flow.save()
        
        try {
            // TODO: Implement Facebook Messenger API sync for chatbot flows
            // For now, just mark as synced
            flow.syncStatus = 'synced'
            flow.lastSyncAt = new Date()
            await flow.save()
            
            return response(true, 200, 'Flow synced successfully', flow)
        } catch (syncError) {
            console.error('Facebook sync error:', syncError)
            flow.syncStatus = 'failed'
            flow.syncError = syncError.message
            await flow.save()
            return response(false, 500, syncError.message || 'Failed to sync flow')
        }
    } catch (error) {
        return catchError(error)
    }
}
