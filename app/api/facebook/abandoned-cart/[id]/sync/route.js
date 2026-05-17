import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import { isAuthenticated } from "@/lib/authentication"
import AbandonedCartRecoveryModel from "@/models/AbandonedCartRecovery.model"
import { metaMessagingAPI } from "@/lib/metaMessagingAPI"
import FacebookConfigModel from "@/models/FacebookConfig.model"

// POST sync abandoned cart recovery campaign to Facebook
export async function POST(request, { params }) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        
        const campaign = await AbandonedCartRecoveryModel.findById(params.id)
        
        if (!campaign) {
            return response(false, 404, 'Campaign not found')
        }
        
        if (campaign.status !== 'active') {
            return response(false, 400, 'Campaign is not active')
        }
        
        campaign.syncStatus = 'syncing'
        await campaign.save()
        
        try {
            const fbConfig = await FacebookConfigModel.getConfig()
            if (!fbConfig.messengerEnabled || !fbConfig.pageAccessToken) {
                campaign.syncStatus = 'failed'
                campaign.syncError = 'Facebook Messenger is not configured'
                await campaign.save()
                return response(false, 400, 'Facebook Messenger is not configured')
            }
            
            // Sync to Facebook
            if (campaign.facebookCampaignId) {
                // Update existing campaign
                const result = await metaMessagingAPI.updateAbandonedCartCampaign({
                    campaignId: campaign.facebookCampaignId,
                    name: campaign.campaignName,
                    pageId: campaign.pageId,
                    triggerDelay: campaign.triggerDelayMinutes,
                    messageSequence: campaign.messageSequence,
                    accessToken: fbConfig.pageAccessToken
                })
                
                if (result.success) {
                    campaign.syncStatus = 'synced'
                    campaign.lastSyncAt = new Date()
                    await campaign.save()
                    
                    return response(true, 200, 'Campaign synced successfully', campaign)
                } else {
                    campaign.syncStatus = 'failed'
                    campaign.syncError = result.message
                    await campaign.save()
                    return response(false, 500, result.message || 'Failed to sync campaign')
                }
            } else {
                // Create new campaign
                const result = await metaMessagingAPI.createAbandonedCartCampaign({
                    name: campaign.campaignName,
                    pageId: campaign.pageId,
                    triggerDelay: campaign.triggerDelayMinutes,
                    messageSequence: campaign.messageSequence,
                    accessToken: fbConfig.pageAccessToken
                })
                
                if (result.success) {
                    campaign.facebookCampaignId = result.data.id
                    campaign.syncStatus = 'synced'
                    campaign.lastSyncAt = new Date()
                    await campaign.save()
                    
                    return response(true, 200, 'Campaign synced successfully', campaign)
                } else {
                    campaign.syncStatus = 'failed'
                    campaign.syncError = result.message
                    await campaign.save()
                    return response(false, 500, result.message || 'Failed to sync campaign')
                }
            }
        } catch (syncError) {
            console.error('Facebook sync error:', syncError)
            campaign.syncStatus = 'failed'
            campaign.syncError = syncError.message
            await campaign.save()
            return response(false, 500, syncError.message || 'Failed to sync campaign')
        }
    } catch (error) {
        return catchError(error)
    }
}
