import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import { isAuthenticated } from "@/lib/authentication"
import AbandonedCartRecoveryModel from "@/models/AbandonedCartRecovery.model"
import { metaMessagingAPI } from "@/lib/metaMessagingAPI"
import FacebookConfigModel from "@/models/FacebookConfig.model"

// GET all abandoned cart recovery campaigns
export async function GET(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        
        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')
        const pageId = searchParams.get('pageId')
        
        let query = {}
        if (status) {
            query.status = status
        }
        if (pageId) {
            query.pageId = pageId
        }
        
        const campaigns = await AbandonedCartRecoveryModel.find(query)
            .sort({ createdAt: -1 })
            .lean()

        return response(true, 200, 'Abandoned cart recovery campaigns fetched successfully', campaigns)
    } catch (error) {
        return catchError(error)
    }
}

// POST create new abandoned cart recovery campaign
export async function POST(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        const payload = await request.json()
        
        // Validate required fields
        if (!payload.campaignName || !payload.pageId) {
            return response(false, 400, 'Missing required fields: campaignName, pageId')
        }
        
        // Validate message sequence
        if (!payload.messageSequence || !Array.isArray(payload.messageSequence) || payload.messageSequence.length === 0) {
            return response(false, 400, 'At least one message in the sequence is required')
        }
        
        // Set created by
        payload.createdBy = auth.user?.id || 'system'
        
        // Create campaign
        const campaign = await AbandonedCartRecoveryModel.create(payload)
        
        // Sync with Facebook if status is active
        if (payload.status === 'active') {
            try {
                const fbConfig = await FacebookConfigModel.getConfig()
                if (fbConfig.messengerEnabled && fbConfig.pageAccessToken) {
                    // Create campaign in Facebook
                    const fbCampaign = await metaMessagingAPI.createAbandonedCartCampaign({
                        name: payload.campaignName,
                        pageId: payload.pageId,
                        triggerDelay: payload.triggerDelayMinutes,
                        messageSequence: payload.messageSequence,
                        accessToken: fbConfig.pageAccessToken
                    })
                    
                    if (fbCampaign.success) {
                        campaign.facebookCampaignId = fbCampaign.data.id
                        campaign.syncStatus = 'synced'
                        campaign.lastSyncAt = new Date()
                        await campaign.save()
                    } else {
                        campaign.syncStatus = 'failed'
                        campaign.syncError = fbCampaign.message
                        await campaign.save()
                    }
                }
            } catch (syncError) {
                console.error('Facebook sync error:', syncError)
                campaign.syncStatus = 'failed'
                campaign.syncError = syncError.message
                await campaign.save()
            }
        }
        
        return response(true, 201, 'Abandoned cart recovery campaign created successfully', campaign)
    } catch (error) {
        return catchError(error)
    }
}
