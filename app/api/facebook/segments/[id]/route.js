import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import { isAuthenticated } from "@/lib/authentication"
import CustomAudienceSegmentModel from "@/models/CustomAudienceSegment.model"
import { metaMarketingAPI } from "@/lib/metaMarketingAPI"
import FacebookConfigModel from "@/models/FacebookConfig.model"

// GET single segment
export async function GET(request, { params }) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        
        const segment = await CustomAudienceSegmentModel.findById(params.id).lean()
        
        if (!segment) {
            return response(false, 404, 'Segment not found')
        }
        
        return response(true, 200, 'Segment fetched successfully', segment)
    } catch (error) {
        return catchError(error)
    }
}

// PUT update segment
export async function PUT(request, { params }) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        const payload = await request.json()
        
        const segment = await CustomAudienceSegmentModel.findByIdAndUpdate(
            params.id,
            { ...payload, updatedBy: auth.user?.id || 'system' },
            { new: true, runValidators: true }
        ).lean()
        
        if (!segment) {
            return response(false, 404, 'Segment not found')
        }
        
        return response(true, 200, 'Segment updated successfully', segment)
    } catch (error) {
        return catchError(error)
    }
}

// DELETE segment
export async function DELETE(request, { params }) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        
        const segment = await CustomAudienceSegmentModel.findById(params.id).lean()
        
        if (!segment) {
            return response(false, 404, 'Segment not found')
        }
        
        // Delete from Facebook if audience exists
        if (segment.facebookAudienceId) {
            try {
                const fbConfig = await FacebookConfigModel.getConfig()
                if (fbConfig.adCampaignManagerEnabled && fbConfig.adAccountAccessToken) {
                    await metaMarketingAPI.deleteCustomAudience({
                        audienceId: segment.facebookAudienceId,
                        accessToken: fbConfig.adAccountAccessToken
                    })
                }
            } catch (syncError) {
                console.error('Facebook sync error:', syncError)
            }
        }
        
        await CustomAudienceSegmentModel.findByIdAndDelete(params.id)
        
        return response(true, 200, 'Segment deleted successfully')
    } catch (error) {
        return catchError(error)
    }
}
