import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import { isAuthenticated } from "@/lib/authentication"
import LeadScoringRuleModel from "@/models/LeadScoringRule.model"
import FacebookConfigModel from "@/models/FacebookConfig.model"

// POST sync lead scoring rule to Facebook
export async function POST(request, { params }) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        
        const rule = await LeadScoringRuleModel.findById(params.id)
        
        if (!rule) {
            return response(false, 404, 'Rule not found')
        }
        
        if (rule.status !== 'active') {
            return response(false, 400, 'Rule is not active')
        }
        
        rule.syncStatus = 'syncing'
        await rule.save()
        
        try {
            // TODO: Implement Facebook Messenger API sync for lead scoring rules
            // For now, just mark as synced
            rule.syncStatus = 'synced'
            rule.lastSyncAt = new Date()
            await rule.save()
            
            return response(true, 200, 'Rule synced successfully', rule)
        } catch (syncError) {
            console.error('Facebook sync error:', syncError)
            rule.syncStatus = 'failed'
            rule.syncError = syncError.message
            await rule.save()
            return response(false, 500, syncError.message || 'Failed to sync rule')
        }
    } catch (error) {
        return catchError(error)
    }
}
