import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import { isAuthenticated } from "@/lib/authentication"
import CustomAudienceSegmentModel from "@/models/CustomAudienceSegment.model"
import { metaMarketingAPI } from "@/lib/metaMarketingAPI"
import FacebookConfigModel from "@/models/FacebookConfig.model"
import User from "@/models/User.model"

// POST sync segment to Facebook
export async function POST(request, { params }) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        
        const segment = await CustomAudienceSegmentModel.findById(params.id)
        
        if (!segment) {
            return response(false, 404, 'Segment not found')
        }
        
        if (segment.status !== 'active') {
            return response(false, 400, 'Segment is not active')
        }
        
        segment.syncStatus = 'syncing'
        await segment.save()
        
        try {
            const fbConfig = await FacebookConfigModel.getConfig()
            if (!fbConfig.adCampaignManagerEnabled || !fbConfig.adAccountAccessToken) {
                segment.syncStatus = 'failed'
                segment.syncError = 'Facebook campaign manager is not configured'
                await segment.save()
                return response(false, 400, 'Facebook campaign manager is not configured')
            }
            
            // Get users matching segment criteria
            const users = await getUsersMatchingSegment(segment)
            
            if (users.length === 0) {
                segment.syncStatus = 'synced'
                segment.actualSize = 0
                segment.lastSyncAt = new Date()
                segment.lastRefreshAt = new Date()
                await segment.save()
                return response(true, 200, 'Segment synced successfully (0 users)', segment)
            }
            
            // Sync to Facebook
            if (segment.facebookAudienceId) {
                // Update existing audience
                const result = await metaMarketingAPI.updateCustomAudience({
                    audienceId: segment.facebookAudienceId,
                    users: users.map(u => u.email || u.phone),
                    accessToken: fbConfig.adAccountAccessToken
                })
                
                if (result.success) {
                    segment.actualSize = users.length
                    segment.syncStatus = 'synced'
                    segment.lastSyncAt = new Date()
                    segment.lastRefreshAt = new Date()
                    segment.lastSizeUpdate = new Date()
                    await segment.save()
                    
                    return response(true, 200, 'Segment synced successfully', segment)
                } else {
                    segment.syncStatus = 'failed'
                    segment.syncError = result.message
                    await segment.save()
                    return response(false, 500, result.message || 'Failed to sync segment')
                }
            } else {
                // Create new audience
                const result = await metaMarketingAPI.createCustomAudience({
                    name: segment.segmentName,
                    description: `Custom audience segment: ${segment.segmentType}`,
                    adAccountId: segment.adAccountId,
                    users: users.map(u => u.email || u.phone),
                    accessToken: fbConfig.adAccountAccessToken
                })
                
                if (result.success) {
                    segment.facebookAudienceId = result.data.id
                    segment.actualSize = users.length
                    segment.syncStatus = 'synced'
                    segment.lastSyncAt = new Date()
                    segment.lastRefreshAt = new Date()
                    segment.lastSizeUpdate = new Date()
                    await segment.save()
                    
                    return response(true, 200, 'Segment synced successfully', segment)
                } else {
                    segment.syncStatus = 'failed'
                    segment.syncError = result.message
                    await segment.save()
                    return response(false, 500, result.message || 'Failed to sync segment')
                }
            }
        } catch (syncError) {
            console.error('Facebook sync error:', syncError)
            segment.syncStatus = 'failed'
            segment.syncError = syncError.message
            await segment.save()
            return response(false, 500, syncError.message || 'Failed to sync segment')
        }
    } catch (error) {
        return catchError(error)
    }
}

// Helper function to get users matching segment criteria
async function getUsersMatchingSegment(segment) {
    try {
        let query = {}
        
        switch (segment.segmentType) {
            case 'behavioral':
                if (segment.behavioralRules && segment.behavioralRules.length > 0) {
                    const rule = segment.behavioralRules[0]
                    const cutoffDate = new Date(Date.now() - (rule.timeRange || 30) * 24 * 60 * 60 * 1000)
                    query.lastActivityAt = { $gte: cutoffDate }
                }
                break
            case 'purchase_history':
                if (segment.purchaseRules && segment.purchaseRules.length > 0) {
                    const rule = segment.purchaseRules[0]
                    query = { 'orders.0': { $exists: true } }
                    
                    if (rule.minPurchaseAmount) {
                        query['totalSpent'] = { $gte: rule.minPurchaseAmount }
                    }
                    if (rule.maxPurchaseAmount) {
                        query['totalSpent'] = { ...query['totalSpent'], $lte: rule.maxPurchaseAmount }
                    }
                }
                break
            case 'demographic':
                if (segment.demographicRules) {
                    if (segment.demographicRules.ageMin) {
                        query.age = { $gte: segment.demographicRules.ageMin }
                    }
                    if (segment.demographicRules.ageMax) {
                        query.age = { ...query.age, $lte: segment.demographicRules.ageMax }
                    }
                    if (segment.demographicRules.gender) {
                        query.gender = segment.demographicRules.gender
                    }
                }
                break
            case 'custom_rule':
                if (segment.customRules && segment.customRules.length > 0) {
                    segment.customRules.forEach(rule => {
                        if (rule.operator === 'equals') {
                            query[rule.field] = rule.value
                        } else if (rule.operator === 'not_equals') {
                            query[rule.field] = { $ne: rule.value }
                        } else if (rule.operator === 'contains') {
                            query[rule.field] = { $regex: rule.value, $options: 'i' }
                        } else if (rule.operator === 'not_contains') {
                            query[rule.field] = { $not: { $regex: rule.value, $options: 'i' } }
                        } else if (rule.operator === 'greater_than') {
                            query[rule.field] = { $gt: rule.value }
                        } else if (rule.operator === 'less_than') {
                            query[rule.field] = { $lt: rule.value }
                        } else if (rule.operator === 'in') {
                            query[rule.field] = { $in: rule.value }
                        } else if (rule.operator === 'not_in') {
                            query[rule.field] = { $nin: rule.value }
                        }
                    })
                }
                break
        }
        
        // Apply exclusions
        if (segment.excludeExistingCustomers) {
            query['orders.0'] = { $exists: false }
        }
        
        const users = await User.find(query).select('email phone').lean()
        return users
    } catch (error) {
        console.error('Error getting users matching segment:', error)
        return []
    }
}
