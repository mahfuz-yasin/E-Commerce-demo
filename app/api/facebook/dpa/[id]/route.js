import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import { isAuthenticated } from "@/lib/authentication"
import DynamicProductAdsModel from "@/models/DynamicProductAds.model"
import { metaMarketingAPI } from "@/lib/metaMarketingAPI"
import FacebookConfigModel from "@/models/FacebookConfig.model"

// GET single DPA campaign
export async function GET(request, { params }) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        
        const campaign = await DynamicProductAdsModel.findById(params.id).lean()
        
        if (!campaign) {
            return response(false, 404, 'Campaign not found')
        }
        
        return response(true, 200, 'Campaign fetched successfully', campaign)
    } catch (error) {
        return catchError(error)
    }
}

// PUT update DPA campaign
export async function PUT(request, { params }) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        const payload = await request.json()
        
        const campaign = await DynamicProductAdsModel.findByIdAndUpdate(
            params.id,
            { ...payload, updatedBy: auth.user?.id || 'system' },
            { new: true, runValidators: true }
        ).lean()
        
        if (!campaign) {
            return response(false, 404, 'Campaign not found')
        }
        
        // Sync with Facebook if status changed to active
        if (payload.status === 'active' && campaign.campaignId) {
            try {
                const fbConfig = await FacebookConfigModel.getConfig()
                if (fbConfig.adCampaignManagerEnabled && fbConfig.adAccountAccessToken) {
                    await metaMarketingAPI.updateDPACampaign({
                        campaignId: campaign.campaignId,
                        status: 'active',
                        accessToken: fbConfig.adAccountAccessToken
                    })
                }
            } catch (syncError) {
                console.error('Facebook sync error:', syncError)
            }
        }
        
        return response(true, 200, 'Campaign updated successfully', campaign)
    } catch (error) {
        return catchError(error)
    }
}

// DELETE DPA campaign
export async function DELETE(request, { params }) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        
        const campaign = await DynamicProductAdsModel.findById(params.id).lean()
        
        if (!campaign) {
            return response(false, 404, 'Campaign not found')
        }
        
        // Delete from Facebook if campaign exists
        if (campaign.campaignId) {
            try {
                const fbConfig = await FacebookConfigModel.getConfig()
                if (fbConfig.adCampaignManagerEnabled && fbConfig.adAccountAccessToken) {
                    await metaMarketingAPI.deleteDPACampaign({
                        campaignId: campaign.campaignId,
                        accessToken: fbConfig.adAccountAccessToken
                    })
                }
            } catch (syncError) {
                console.error('Facebook sync error:', syncError)
            }
        }
        
        await DynamicProductAdsModel.findByIdAndDelete(params.id)
        
        return response(true, 200, 'Campaign deleted successfully')
    } catch (error) {
        return catchError(error)
    }
}
