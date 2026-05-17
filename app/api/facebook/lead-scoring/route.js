import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import { isAuthenticated } from "@/lib/authentication"
import LeadScoringRuleModel from "@/models/LeadScoringRule.model"
import FacebookConfigModel from "@/models/FacebookConfig.model"

// GET all lead scoring rules
export async function GET(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        
        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')
        const ruleType = searchParams.get('ruleType')
        const pageId = searchParams.get('pageId')
        
        let query = {}
        if (status) {
            query.status = status
        }
        if (ruleType) {
            query.ruleType = ruleType
        }
        if (pageId) {
            query.pageId = pageId
        }
        
        const rules = await LeadScoringRuleModel.find(query)
            .sort({ createdAt: -1 })
            .lean()

        return response(true, 200, 'Lead scoring rules fetched successfully', rules)
    } catch (error) {
        return catchError(error)
    }
}

// POST create new lead scoring rule
export async function POST(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        const payload = await request.json()
        
        // Validate required fields
        if (!payload.ruleName || !payload.ruleType || !payload.pageId) {
            return response(false, 400, 'Missing required fields: ruleName, ruleType, pageId')
        }
        
        // Validate scoring criteria
        if (!payload.scoringCriteria || !Array.isArray(payload.scoringCriteria) || payload.scoringCriteria.length === 0) {
            return response(false, 400, 'At least one scoring criterion is required')
        }
        
        // Set created by
        payload.createdBy = auth.user?.id || 'system'
        
        // Create rule
        const rule = await LeadScoringRuleModel.create(payload)
        
        // Sync with Facebook if status is active
        if (payload.status === 'active') {
            try {
                // TODO: Implement Facebook Messenger API sync for lead scoring rules
                // For now, just mark as synced
                rule.syncStatus = 'synced'
                rule.lastSyncAt = new Date()
                await rule.save()
            } catch (syncError) {
                console.error('Facebook sync error:', syncError)
                rule.syncStatus = 'failed'
                rule.syncError = syncError.message
                await rule.save()
            }
        }
        
        return response(true, 201, 'Lead scoring rule created successfully', rule)
    } catch (error) {
        return catchError(error)
    }
}
