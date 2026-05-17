import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import { isAuthenticated } from "@/lib/authentication"
import DynamicProductAdsModel from "@/models/DynamicProductAds.model"
import FacebookConfigModel from "@/models/FacebookConfig.model"
import { metaMarketingAPI } from "@/lib/metaMarketingAPI"

// GET all DPA campaigns
export async function GET(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        
        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')
        const adAccountId = searchParams.get('adAccountId')
        
        let query = {}
        if (status) {
            query.status = status
        }
        if (adAccountId) {
            query.adAccountId = adAccountId
        }
        
        const campaigns = await DynamicProductAdsModel.find(query)
            .sort({ createdAt: -1 })
            .lean()

        return response(true, 200, 'DPA campaigns fetched successfully', campaigns)
    } catch (error) {
        return catchError(error)
    }
}

// POST create new DPA campaign
export async function POST(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        const payload = await request.json()
        
        // Validate required fields
        if (!payload.campaignName || !payload.adAccountId || !payload.catalogId) {
            return response(false, 400, 'Missing required fields: campaignName, adAccountId, catalogId')
        }
        
        // Set created by
        payload.createdBy = auth.user?.id || 'system'
        
        // Create DPA campaign
        const campaign = await DynamicProductAdsModel.create(payload)
        
        // Sync with Facebook if status is active
        if (payload.status === 'active') {
            try {
                const fbConfig = await FacebookConfigModel.getConfig()
                if (fbConfig.adCampaignManagerEnabled && fbConfig.adAccountAccessToken) {
                    // Create campaign in Facebook
                    const fbCampaign = await metaMarketingAPI.createDPACampaign({
                        name: payload.campaignName,
                        adAccountId: payload.adAccountId,
                        catalogId: payload.catalogId,
                        accessToken: fbConfig.adAccountAccessToken,
                        ...payload
                    })
                    
                    if (fbCampaign.success) {
                        campaign.campaignId = fbCampaign.data.id
                        campaign.syncStatus = 'synced'
                        campaign.lastSyncAt = new Date()
                        await campaign.save()
                    } else {
                        campaign.syncStatus = 'failed'
                        await campaign.save()
                    }
                }
            } catch (syncError) {
                console.error('Facebook sync error:', syncError)
                campaign.syncStatus = 'failed'
                await campaign.save()
            }
        }
        
        return response(true, 201, 'DPA campaign created successfully', campaign)
    } catch (error) {
        return catchError(error)
    }
}
