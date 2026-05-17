import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import { isAuthenticated } from "@/lib/authentication"
import ChatbotFlowModel from "@/models/ChatbotFlow.model"
import { metaMessagingAPI } from "@/lib/metaMessagingAPI"
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
            const fbConfig = await FacebookConfigModel.getConfig()
            if (!fbConfig.messengerEnabled || !fbConfig.pageAccessToken) {
                flow.syncStatus = 'failed'
                flow.syncError = 'Facebook Messenger is not configured'
                await flow.save()
                return response(false, 400, 'Facebook Messenger is not configured')
            }
            
            // Sync to Facebook
            if (flow.facebookFlowId) {
                // Update existing flow
                const result = await metaMessagingAPI.updateChatbotFlow({
                    flowId: flow.facebookFlowId,
                    name: flow.flowName,
                    pageId: flow.pageId,
                    welcomeMessage: flow.welcomeMessage,
                    steps: flow.steps,
                    accessToken: fbConfig.pageAccessToken
                })
                
                if (result.success) {
                    flow.syncStatus = 'synced'
                    flow.lastSyncAt = new Date()
                    await flow.save()
                    
                    return response(true, 200, 'Flow synced successfully', flow)
                } else {
                    flow.syncStatus = 'failed'
                    flow.syncError = result.message
                    await flow.save()
                    return response(false, 500, result.message || 'Failed to sync flow')
                }
            } else {
                // Create new flow
                const result = await metaMessagingAPI.createChatbotFlow({
                    name: flow.flowName,
                    pageId: flow.pageId,
                    welcomeMessage: flow.welcomeMessage,
                    steps: flow.steps,
                    accessToken: fbConfig.pageAccessToken
                })
                
                if (result.success) {
                    flow.facebookFlowId = result.data.id
                    flow.syncStatus = 'synced'
                    flow.lastSyncAt = new Date()
                    await flow.save()
                    
                    return response(true, 200, 'Flow synced successfully', flow)
                } else {
                    flow.syncStatus = 'failed'
                    flow.syncError = result.message
                    await flow.save()
                    return response(false, 500, result.message || 'Failed to sync flow')
                }
            }
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
