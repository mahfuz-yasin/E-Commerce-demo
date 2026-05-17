import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import { isAuthenticated } from "@/lib/authentication"
import AutoResponseModel from "@/models/AutoResponse.model"
import { metaMessagingAPI } from "@/lib/metaMessagingAPI"
import FacebookConfigModel from "@/models/FacebookConfig.model"

// GET all auto responses
export async function GET(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        
        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')
        const responseType = searchParams.get('responseType')
        const pageId = searchParams.get('pageId')
        
        let query = {}
        if (status) {
            query.status = status
        }
        if (responseType) {
            query.responseType = responseType
        }
        if (pageId) {
            query.pageId = pageId
        }
        
        const responses = await AutoResponseModel.find(query)
            .sort({ createdAt: -1 })
            .lean()

        return response(true, 200, 'Auto responses fetched successfully', responses)
    } catch (error) {
        return catchError(error)
    }
}

// POST create new auto response
export async function POST(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        const payload = await request.json()
        
        // Validate required fields
        if (!payload.responseName || !payload.triggerType || !payload.pageId) {
            return response(false, 400, 'Missing required fields: responseName, triggerType, pageId')
        }
        
        // Validate trigger-specific fields
        if (payload.triggerType === 'keyword' && (!payload.keywords || payload.keywords.length === 0)) {
            return response(false, 400, 'Keywords are required for keyword triggers')
        }
        if (payload.triggerType === 'regex' && !payload.regexPattern) {
            return response(false, 400, 'Regex pattern is required for regex triggers')
        }
        if (payload.triggerType === 'event' && !payload.eventType) {
            return response(false, 400, 'Event type is required for event triggers')
        }
        
        // Set created by
        payload.createdBy = auth.user?.id || 'system'
        
        // Create response
        const response = await AutoResponseModel.create(payload)
        
        // Sync with Facebook if status is active
        if (payload.status === 'active') {
            try {
                const fbConfig = await FacebookConfigModel.getConfig()
                if (fbConfig.messengerEnabled && fbConfig.pageAccessToken) {
                    // Create response in Facebook
                    const fbResponse = await metaMessagingAPI.createAutoResponse({
                        name: payload.responseName,
                        pageId: payload.pageId,
                        triggerType: payload.triggerType,
                        keywords: payload.keywords,
                        text: payload.text,
                        accessToken: fbConfig.pageAccessToken
                    })
                    
                    if (fbResponse.success) {
                        response.facebookResponseId = fbResponse.data.id
                        response.syncStatus = 'synced'
                        response.lastSyncAt = new Date()
                        await response.save()
                    } else {
                        response.syncStatus = 'failed'
                        response.syncError = fbResponse.message
                        await response.save()
                    }
                }
            } catch (syncError) {
                console.error('Facebook sync error:', syncError)
                response.syncStatus = 'failed'
                response.syncError = syncError.message
                await response.save()
            }
        }
        
        return response(true, 201, 'Auto response created successfully', response)
    } catch (error) {
        return catchError(error)
    }
}
