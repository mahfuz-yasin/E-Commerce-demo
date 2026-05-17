import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import { isAuthenticated } from "@/lib/authentication"
import RetargetingRuleModel from "@/models/RetargetingRule.model"
import { metaMarketingAPI } from "@/lib/metaMarketingAPI"
import FacebookConfigModel from "@/models/FacebookConfig.model"

// GET single retargeting rule
export async function GET(request, { params }) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        
        const rule = await RetargetingRuleModel.findById(params.id).lean()
        
        if (!rule) {
            return response(false, 404, 'Rule not found')
        }
        
        return response(true, 200, 'Rule fetched successfully', rule)
    } catch (error) {
        return catchError(error)
    }
}

// PUT update retargeting rule
export async function PUT(request, { params }) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        const payload = await request.json()
        
        const rule = await RetargetingRuleModel.findByIdAndUpdate(
            params.id,
            { ...payload, updatedBy: auth.user?.id || 'system' },
            { new: true, runValidators: true }
        ).lean()
        
        if (!rule) {
            return response(false, 404, 'Rule not found')
        }
        
        return response(true, 200, 'Rule updated successfully', rule)
    } catch (error) {
        return catchError(error)
    }
}

// DELETE retargeting rule
export async function DELETE(request, { params }) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        
        const rule = await RetargetingRuleModel.findById(params.id).lean()
        
        if (!rule) {
            return response(false, 404, 'Rule not found')
        }
        
        // Delete from Facebook if audience exists
        if (rule.facebookAudienceId) {
            try {
                const fbConfig = await FacebookConfigModel.getConfig()
                if (fbConfig.adCampaignManagerEnabled && fbConfig.adAccountAccessToken) {
                    await metaMarketingAPI.deleteCustomAudience({
                        audienceId: rule.facebookAudienceId,
                        accessToken: fbConfig.adAccountAccessToken
                    })
                }
            } catch (syncError) {
                console.error('Facebook sync error:', syncError)
            }
        }
        
        await RetargetingRuleModel.findByIdAndDelete(params.id)
        
        return response(true, 200, 'Rule deleted successfully')
    } catch (error) {
        return catchError(error)
    }
}
