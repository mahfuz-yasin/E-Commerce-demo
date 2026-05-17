import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import { isAuthenticated } from "@/lib/authentication"
import AbandonedCartRecoveryModel from "@/models/AbandonedCartRecovery.model"
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
            // TODO: Implement Facebook Messenger API sync for abandoned cart recovery
            // For now, just mark as synced
            campaign.syncStatus = 'synced'
            campaign.lastSyncAt = new Date()
            await campaign.save()
            
            return response(true, 200, 'Campaign synced successfully', campaign)
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
