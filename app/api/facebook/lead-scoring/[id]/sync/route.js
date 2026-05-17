import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import { isAuthenticated } from "@/lib/authentication"
import LeadScoringRuleModel from "@/models/LeadScoringRule.model"
import { metaMessagingAPI } from "@/lib/metaMessagingAPI"
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
            const fbConfig = await FacebookConfigModel.getConfig()
            if (!fbConfig.messengerEnabled || !fbConfig.pageAccessToken) {
                rule.syncStatus = 'failed'
                rule.syncError = 'Facebook Messenger is not configured'
                await rule.save()
                return response(false, 400, 'Facebook Messenger is not configured')
            }
            
            // Sync to Facebook
            if (rule.facebookRuleId) {
                // Update existing rule
                const result = await metaMessagingAPI.updateLeadScoringRule({
                    ruleId: rule.facebookRuleId,
                    name: rule.ruleName,
                    pageId: rule.pageId,
                    scoringCriteria: rule.scoringCriteria,
                    scoreThresholds: rule.scoreThresholds,
                    accessToken: fbConfig.pageAccessToken
                })
                
                if (result.success) {
                    rule.syncStatus = 'synced'
                    rule.lastSyncAt = new Date()
                    await rule.save()
                    
                    return response(true, 200, 'Rule synced successfully', rule)
                } else {
                    rule.syncStatus = 'failed'
                    rule.syncError = result.message
                    await rule.save()
                    return response(false, 500, result.message || 'Failed to sync rule')
                }
            } else {
                // Create new rule
                const result = await metaMessagingAPI.createLeadScoringRule({
                    name: rule.ruleName,
                    pageId: rule.pageId,
                    scoringCriteria: rule.scoringCriteria,
                    scoreThresholds: rule.scoreThresholds,
                    accessToken: fbConfig.pageAccessToken
                })
                
                if (result.success) {
                    rule.facebookRuleId = result.data.id
                    rule.syncStatus = 'synced'
                    rule.lastSyncAt = new Date()
                    await rule.save()
                    
                    return response(true, 200, 'Rule synced successfully', rule)
                } else {
                    rule.syncStatus = 'failed'
                    rule.syncError = result.message
                    await rule.save()
                    return response(false, 500, result.message || 'Failed to sync rule')
                }
            }
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
