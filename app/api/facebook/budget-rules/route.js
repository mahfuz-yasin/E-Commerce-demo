import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import { isAuthenticated } from "@/lib/authentication"
import BudgetOptimizationRuleModel from "@/models/BudgetOptimizationRule.model"
import { metaMarketingAPI } from "@/lib/metaMarketingAPI"
import FacebookConfigModel from "@/models/FacebookConfig.model"

// GET all budget optimization rules
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
        const adAccountId = searchParams.get('adAccountId')
        
        let query = {}
        if (status) {
            query.status = status
        }
        if (ruleType) {
            query.ruleType = ruleType
        }
        if (adAccountId) {
            query.adAccountId = adAccountId
        }
        
        const rules = await BudgetOptimizationRuleModel.find(query)
            .sort({ createdAt: -1 })
            .lean()

        return response(true, 200, 'Budget rules fetched successfully', rules)
    } catch (error) {
        return catchError(error)
    }
}

// POST create new budget optimization rule
export async function POST(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        const payload = await request.json()
        
        // Validate required fields
        if (!payload.ruleName || !payload.ruleType || !payload.adAccountId) {
            return response(false, 400, 'Missing required fields: ruleName, ruleType, adAccountId')
        }
        
        // Validate rule type specific fields
        if (payload.ruleType === 'roas_based' && !payload.roasTarget) {
            return response(false, 400, 'roasTarget is required for roas_based rules')
        }
        if (payload.ruleType === 'cpa_based' && !payload.cpaTarget) {
            return response(false, 400, 'cpaTarget is required for cpa_based rules')
        }
        if (payload.ruleType === 'performance_based' && (!payload.performanceMetric || !payload.performanceThreshold)) {
            return response(false, 400, 'performanceMetric and performanceThreshold are required for performance_based rules')
        }
        
        // Set created by
        payload.createdBy = auth.user?.id || 'system'
        
        // Create budget rule
        const rule = await BudgetOptimizationRuleModel.create(payload)
        
        // Sync with Facebook if status is active
        if (payload.status === 'active') {
            try {
                const fbConfig = await FacebookConfigModel.getConfig()
                if (fbConfig.adCampaignManagerEnabled && fbConfig.adAccountAccessToken) {
                    // Create rule in Facebook
                    const fbRule = await metaMarketingAPI.createBudgetRule({
                        ruleName: payload.ruleName,
                        ruleType: payload.ruleType,
                        adAccountId: payload.adAccountId,
                        campaignIds: payload.campaignIds,
                        accessToken: fbConfig.adAccountAccessToken
                    })
                    
                    if (fbRule.success) {
                        rule.syncStatus = 'synced'
                        rule.lastSyncAt = new Date()
                        await rule.save()
                    } else {
                        rule.syncStatus = 'failed'
                        await rule.save()
                    }
                }
            } catch (syncError) {
                console.error('Facebook sync error:', syncError)
                rule.syncStatus = 'failed'
                await rule.save()
            }
        }
        
        return response(true, 201, 'Budget rule created successfully', rule)
    } catch (error) {
        return catchError(error)
    }
}
