import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import { isAuthenticated } from "@/lib/authentication"
import ChatbotFlowModel from "@/models/ChatbotFlow.model"
import { metaMessagingAPI } from "@/lib/metaMessagingAPI"
import FacebookConfigModel from "@/models/FacebookConfig.model"

// GET all chatbot flows
export async function GET(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        
        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')
        const flowType = searchParams.get('flowType')
        const pageId = searchParams.get('pageId')
        
        let query = {}
        if (status) {
            query.status = status
        }
        if (flowType) {
            query.flowType = flowType
        }
        if (pageId) {
            query.pageId = pageId
        }
        
        const flows = await ChatbotFlowModel.find(query)
            .sort({ createdAt: -1 })
            .lean()

        return response(true, 200, 'Chatbot flows fetched successfully', flows)
    } catch (error) {
        return catchError(error)
    }
}

// POST create new chatbot flow
export async function POST(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        const payload = await request.json()
        
        // Validate required fields
        if (!payload.flowName || !payload.flowType || !payload.pageId || !payload.welcomeMessage) {
            return response(false, 400, 'Missing required fields: flowName, flowType, pageId, welcomeMessage')
        }
        
        // Validate steps
        if (!payload.steps || !Array.isArray(payload.steps) || payload.steps.length === 0) {
            return response(false, 400, 'At least one step is required')
        }
        
        // Set created by
        payload.createdBy = auth.user?.id || 'system'
        
        // Create flow
        const flow = await ChatbotFlowModel.create(payload)
        
        // Sync with Facebook if status is active
        if (payload.status === 'active') {
            try {
                const fbConfig = await FacebookConfigModel.getConfig()
                if (fbConfig.messengerEnabled && fbConfig.pageAccessToken) {
                    // Create flow in Facebook
                    const fbFlow = await metaMessagingAPI.createChatbotFlow({
                        name: payload.flowName,
                        pageId: payload.pageId,
                        welcomeMessage: payload.welcomeMessage,
                        steps: payload.steps,
                        accessToken: fbConfig.pageAccessToken
                    })
                    
                    if (fbFlow.success) {
                        flow.facebookFlowId = fbFlow.data.id
                        flow.syncStatus = 'synced'
                        flow.lastSyncAt = new Date()
                        await flow.save()
                    } else {
                        flow.syncStatus = 'failed'
                        flow.syncError = fbFlow.message
                        await flow.save()
                    }
                }
            } catch (syncError) {
                console.error('Facebook sync error:', syncError)
                flow.syncStatus = 'failed'
                flow.syncError = syncError.message
                await flow.save()
            }
        }
        
        return response(true, 201, 'Chatbot flow created successfully', flow)
    } catch (error) {
        return catchError(error)
    }
}
