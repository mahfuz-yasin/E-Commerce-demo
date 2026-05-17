import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import { isAuthenticated } from "@/lib/authentication"
import RetargetingRuleModel from "@/models/RetargetingRule.model"
import { metaMarketingAPI } from "@/lib/metaMarketingAPI"
import FacebookConfigModel from "@/models/FacebookConfig.model"
import User from "@/models/User.model"

// POST sync retargeting rule to Facebook
export async function POST(request, { params }) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        
        const rule = await RetargetingRuleModel.findById(params.id)
        
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
            if (!fbConfig.adCampaignManagerEnabled || !fbConfig.adAccountAccessToken) {
                rule.syncStatus = 'failed'
                rule.syncError = 'Facebook campaign manager is not configured'
                await rule.save()
                return response(false, 400, 'Facebook campaign manager is not configured')
            }
            
            // Get users matching rule criteria
            const users = await getUsersMatchingRule(rule)
            
            if (users.length === 0) {
                rule.syncStatus = 'synced'
                rule.actualSize = 0
                rule.lastSyncAt = new Date()
                rule.lastRefreshAt = new Date()
                await rule.save()
                return response(true, 200, 'Rule synced successfully (0 users)', rule)
            }
            
            // Sync to Facebook
            if (rule.facebookAudienceId) {
                // Update existing audience
                const result = await metaMarketingAPI.updateCustomAudience({
                    audienceId: rule.facebookAudienceId,
                    users: users.map(u => u.email || u.phone),
                    accessToken: fbConfig.adAccountAccessToken
                })
                
                if (result.success) {
                    rule.actualSize = users.length
                    rule.syncStatus = 'synced'
                    rule.lastSyncAt = new Date()
                    rule.lastRefreshAt = new Date()
                    rule.lastSizeUpdate = new Date()
                    await rule.save()
                    
                    return response(true, 200, 'Rule synced successfully', rule)
                } else {
                    rule.syncStatus = 'failed'
                    rule.syncError = result.message
                    await rule.save()
                    return response(false, 500, result.message || 'Failed to sync rule')
                }
            } else {
                // Create new audience
                const result = await metaMarketingAPI.createCustomAudience({
                    name: rule.ruleName,
                    description: `Retargeting audience: ${rule.ruleType}`,
                    adAccountId: rule.adAccountId,
                    users: users.map(u => u.email || u.phone),
                    accessToken: fbConfig.adAccountAccessToken
                })
                
                if (result.success) {
                    rule.facebookAudienceId = result.data.id
                    rule.actualSize = users.length
                    rule.syncStatus = 'synced'
                    rule.lastSyncAt = new Date()
                    rule.lastRefreshAt = new Date()
                    rule.lastSizeUpdate = new Date()
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
