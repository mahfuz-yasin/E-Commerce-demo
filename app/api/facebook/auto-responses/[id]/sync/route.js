import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import { isAuthenticated } from "@/lib/authentication"
import AutoResponseModel from "@/models/AutoResponse.model"
import { metaMessagingAPI } from "@/lib/metaMessagingAPI"
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
            const fbConfig = await FacebookConfigModel.getConfig()
            if (!fbConfig.messengerEnabled || !fbConfig.pageAccessToken) {
                autoResponse.syncStatus = 'failed'
                autoResponse.syncError = 'Facebook Messenger is not configured'
                await autoResponse.save()
                return response(false, 400, 'Facebook Messenger is not configured')
            }
            
            // Sync to Facebook
            if (autoResponse.facebookResponseId) {
                // Update existing response
                const result = await metaMessagingAPI.updateAutoResponse({
                    responseId: autoResponse.facebookResponseId,
                    name: autoResponse.responseName,
                    pageId: autoResponse.pageId,
                    triggerType: autoResponse.triggerType,
                    keywords: autoResponse.keywords,
                    text: autoResponse.text,
                    accessToken: fbConfig.pageAccessToken
                })
                
                if (result.success) {
                    autoResponse.syncStatus = 'synced'
                    autoResponse.lastSyncAt = new Date()
                    await autoResponse.save()
                    
                    return response(true, 200, 'Response synced successfully', autoResponse)
                } else {
                    autoResponse.syncStatus = 'failed'
                    autoResponse.syncError = result.message
                    await autoResponse.save()
                    return response(false, 500, result.message || 'Failed to sync response')
                }
            } else {
                // Create new response
                const result = await metaMessagingAPI.createAutoResponse({
                    name: autoResponse.responseName,
                    pageId: autoResponse.pageId,
                    triggerType: autoResponse.triggerType,
                    keywords: autoResponse.keywords,
                    text: autoResponse.text,
                    accessToken: fbConfig.pageAccessToken
                })
                
                if (result.success) {
                    autoResponse.facebookResponseId = result.data.id
                    autoResponse.syncStatus = 'synced'
                    autoResponse.lastSyncAt = new Date()
                    await autoResponse.save()
                    
                    return response(true, 200, 'Response synced successfully', autoResponse)
                } else {
                    autoResponse.syncStatus = 'failed'
                    autoResponse.syncError = result.message
                    await autoResponse.save()
                    return response(false, 500, result.message || 'Failed to sync response')
                }
            }
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
