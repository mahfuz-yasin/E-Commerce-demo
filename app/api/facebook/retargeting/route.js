import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import { isAuthenticated } from "@/lib/authentication"
import RetargetingRuleModel from "@/models/RetargetingRule.model"
import { metaMarketingAPI } from "@/lib/metaMarketingAPI"
import FacebookConfigModel from "@/models/FacebookConfig.model"
import User from "@/models/User.model"

// GET all retargeting rules
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
        
        const rules = await RetargetingRuleModel.find(query)
            .sort({ createdAt: -1 })
            .lean()

        return response(true, 200, 'Retargeting rules fetched successfully', rules)
    } catch (error) {
        return catchError(error)
    }
}

// POST create new retargeting rule
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
        if (payload.ruleType === 'viewed_products' && !payload.viewedProductsRules) {
            return response(false, 400, 'viewedProductsRules are required for viewed_products rules')
        }
        if (payload.ruleType === 'added_to_cart' && !payload.addedToCartRules) {
            return response(false, 400, 'addedToCartRules are required for added_to_cart rules')
        }
        if (payload.ruleType === 'purchased' && !payload.purchasedRules) {
            return response(false, 400, 'purchasedRules are required for purchased rules')
        }
        if (payload.ruleType === 'browse_abandonment' && !payload.browseAbandonmentRules) {
            return response(false, 400, 'browseAbandonmentRules are required for browse_abandonment rules')
        }
        if (payload.ruleType === 'cart_abandonment' && !payload.cartAbandonmentRules) {
            return response(false, 400, 'cartAbandonmentRules are required for cart_abandonment rules')
        }
        
        // Set created by
        payload.createdBy = auth.user?.id || 'system'
        
        // Estimate rule size
        payload.estimatedSize = await estimateRuleSize(payload)
        
        // Create rule
        const rule = await RetargetingRuleModel.create(payload)
        
        // Sync with Facebook if status is active
        if (payload.status === 'active') {
            try {
                const fbConfig = await FacebookConfigModel.getConfig()
                if (fbConfig.adCampaignManagerEnabled && fbConfig.adAccountAccessToken) {
                    // Get users matching rule criteria
                    const users = await getUsersMatchingRule(rule)
                    
                    // Create custom audience in Facebook
                    const fbAudience = await metaMarketingAPI.createCustomAudience({
                        name: payload.ruleName,
                        description: `Retargeting audience: ${payload.ruleType}`,
                        adAccountId: payload.adAccountId,
                        users: users.map(u => u.email || u.phone),
                        accessToken: fbConfig.adAccountAccessToken
                    })
                    
                    if (fbAudience.success) {
                        rule.facebookAudienceId = fbAudience.data.id
                        rule.actualSize = users.length
                        rule.syncStatus = 'synced'
                        rule.lastSyncAt = new Date()
                        rule.lastRefreshAt = new Date()
                        await rule.save()
                    } else {
                        rule.syncStatus = 'failed'
                        rule.syncError = fbAudience.message
                        await rule.save()
                    }
                }
            } catch (syncError) {
                console.error('Facebook sync error:', syncError)
                rule.syncStatus = 'failed'
                rule.syncError = syncError.message
                await rule.save()
            }
        }
        
        return response(true, 201, 'Retargeting rule created successfully', rule)
    } catch (error) {
        return catchError(error)
    }
}

// Helper function to estimate rule size
async function estimateRuleSize(rule) {
    try {
        let query = {}
        
        switch (rule.ruleType) {
            case 'viewed_products':
                query = { lastActivityAt: { $gte: new Date(Date.now() - (rule.viewedProductsRules?.timeRange || 30) * 24 * 60 * 60 * 1000) } }
                break
            case 'added_to_cart':
                query = { 'cart.items.0': { $exists: true } }
                break
            case 'purchased':
                query = { 'orders.0': { $exists: true } }
                break
            case 'browse_abandonment':
                query = { pageViews: { $gte: rule.browseAbandonmentRules?.pageViewsThreshold || 2 } }
                break
            case 'cart_abandonment':
                query = { 'cart.items.0': { $exists: true } }
                break
        }
        
        const count = await User.countDocuments(query)
        return Math.floor(count * 0.15) // Rough estimate
    } catch (error) {
        return 0
    }
}

// Helper function to get users matching rule criteria
async function getUsersMatchingRule(rule) {
    try {
        let query = {}
        
        switch (rule.ruleType) {
            case 'viewed_products':
                if (rule.viewedProductsRules) {
                    const cutoffDate = new Date(Date.now() - (rule.viewedProductsRules.timeRange || 30) * 24 * 60 * 60 * 1000)
                    query.lastActivityAt = { $gte: cutoffDate }
                    query.viewedProducts = { $gte: rule.viewedProductsRules.minViews || 1 }
                    
                    if (rule.viewedProductsRules.excludePurchased) {
                        const purchaseCutoff = new Date(Date.now() - (rule.viewedProductsRules.purchaseExclusionDays || 30) * 24 * 60 * 60 * 1000)
                        query['orders.createdAt'] = { $not: { $gte: purchaseCutoff } }
                    }
                }
                break
            case 'added_to_cart':
                if (rule.addedToCartRules) {
                    query = { 'cart.items.0': { $exists: true } }
                    query.lastCartUpdate = { $gte: new Date(Date.now() - (rule.addedToCartRules.timeRange || 7) * 24 * 60 * 60 * 1000) }
                    
                    if (rule.addedToCartRules.excludePurchased) {
                        const purchaseCutoff = new Date(Date.now() - (rule.addedToCartRules.purchaseExclusionDays || 30) * 24 * 60 * 60 * 1000)
                        query['orders.createdAt'] = { $not: { $gte: purchaseCutoff } }
                    }
                }
                break
            case 'purchased':
                if (rule.purchasedRules) {
                    query = { 'orders.0': { $exists: true } }
                    const cutoffDate = new Date(Date.now() - (rule.purchasedRules.timeRange || 90) * 24 * 60 * 60 * 1000)
                    query['orders.createdAt'] = { $gte: cutoffDate }
                    
                    if (rule.purchasedRules.minPurchaseAmount) {
                        query['totalSpent'] = { $gte: rule.purchasedRules.minPurchaseAmount }
                    }
                    if (rule.purchasedRules.maxPurchaseAmount) {
                        query['totalSpent'] = { ...query['totalSpent'], $lte: rule.purchasedRules.maxPurchaseAmount }
                    }
                }
                break
            case 'browse_abandonment':
                if (rule.browseAbandonmentRules) {
                    query.pageViews = { $gte: rule.browseAbandonmentRules.pageViewsThreshold || 2 }
                    query.timeOnSite = { $gte: rule.browseAbandonmentRules.timeOnSiteThreshold || 30 }
                    query.lastActivityAt = { $gte: new Date(Date.now() - (rule.browseAbandonmentRules.timeRange || 7) * 24 * 60 * 60 * 1000) }
                }
                break
            case 'cart_abandonment':
                if (rule.cartAbandonmentRules) {
                    query = { 'cart.items.0': { $exists: true } }
                    query.lastCartUpdate = { $gte: new Date(Date.now() - (rule.cartAbandonmentRules.timeRange || 7) * 24 * 60 * 60 * 1000) }
                    
                    if (rule.cartAbandonmentRules.minCartValue) {
                        query['cart.total'] = { $gte: rule.cartAbandonmentRules.minCartValue }
                    }
                    if (rule.cartAbandonmentRules.maxCartValue) {
                        query['cart.total'] = { ...query['cart.total'], $lte: rule.cartAbandonmentRules.maxCartValue }
                    }
                }
                break
        }
        
        const users = await User.find(query).select('email phone').lean()
        return users
    } catch (error) {
        console.error('Error getting users matching rule:', error)
        return []
    }
}
