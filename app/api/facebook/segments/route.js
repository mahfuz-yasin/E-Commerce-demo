import { connectDB } from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperFunction"
import { isAuthenticated } from "@/lib/authentication"
import CustomAudienceSegmentModel from "@/models/CustomAudienceSegment.model"
import { metaMarketingAPI } from "@/lib/metaMarketingAPI"
import FacebookConfigModel from "@/models/FacebookConfig.model"
import User from "@/models/User.model"
import Order from "@/models/Order.model"

// GET all custom audience segments
export async function GET(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        
        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')
        const segmentType = searchParams.get('segmentType')
        const adAccountId = searchParams.get('adAccountId')
        
        let query = {}
        if (status) {
            query.status = status
        }
        if (segmentType) {
            query.segmentType = segmentType
        }
        if (adAccountId) {
            query.adAccountId = adAccountId
        }
        
        const segments = await CustomAudienceSegmentModel.find(query)
            .sort({ createdAt: -1 })
            .lean()

        return response(true, 200, 'Segments fetched successfully', segments)
    } catch (error) {
        return catchError(error)
    }
}

// POST create new custom audience segment
export async function POST(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        const payload = await request.json()
        
        // Validate required fields
        if (!payload.segmentName || !payload.segmentType || !payload.adAccountId) {
            return response(false, 400, 'Missing required fields: segmentName, segmentType, adAccountId')
        }
        
        // Validate segment type specific fields
        if (payload.segmentType === 'behavioral' && (!payload.behavioralRules || payload.behavioralRules.length === 0)) {
            return response(false, 400, 'behavioralRules are required for behavioral segments')
        }
        if (payload.segmentType === 'demographic' && !payload.demographicRules) {
            return response(false, 400, 'demographicRules are required for demographic segments')
        }
        if (payload.segmentType === 'purchase_history' && (!payload.purchaseRules || payload.purchaseRules.length === 0)) {
            return response(false, 400, 'purchaseRules are required for purchase_history segments')
        }
        if (payload.segmentType === 'custom_rule' && (!payload.customRules || payload.customRules.length === 0)) {
            return response(false, 400, 'customRules are required for custom_rule segments')
        }
        
        // Set created by
        payload.createdBy = auth.user?.id || 'system'
        
        // Estimate segment size
        payload.estimatedSize = await estimateSegmentSize(payload)
        
        // Create segment
        const segment = await CustomAudienceSegmentModel.create(payload)
        
        // Sync with Facebook if status is active
        if (payload.status === 'active') {
            try {
                const fbConfig = await FacebookConfigModel.getConfig()
                if (fbConfig.adCampaignManagerEnabled && fbConfig.adAccountAccessToken) {
                    // Get users matching segment criteria
                    const users = await getUsersMatchingSegment(segment)
                    
                    // Create custom audience in Facebook
                    const fbAudience = await metaMarketingAPI.createCustomAudience({
                        name: payload.segmentName,
                        description: `Custom audience segment: ${payload.segmentType}`,
                        adAccountId: payload.adAccountId,
                        users: users.map(u => u.email || u.phone),
                        accessToken: fbConfig.adAccountAccessToken
                    })
                    
                    if (fbAudience.success) {
                        segment.facebookAudienceId = fbAudience.data.id
                        segment.actualSize = users.length
                        segment.syncStatus = 'synced'
                        segment.lastSyncAt = new Date()
                        segment.lastRefreshAt = new Date()
                        await segment.save()
                    } else {
                        segment.syncStatus = 'failed'
                        segment.syncError = fbAudience.message
                        await segment.save()
                    }
                }
            } catch (syncError) {
                console.error('Facebook sync error:', syncError)
                segment.syncStatus = 'failed'
                segment.syncError = syncError.message
                await segment.save()
            }
        }
        
        return response(true, 201, 'Segment created successfully', segment)
    } catch (error) {
        return catchError(error)
    }
}

// Helper function to estimate segment size
async function estimateSegmentSize(segment) {
    try {
        let query = {}
        
        switch (segment.segmentType) {
            case 'behavioral':
                // Estimate based on recent activity
                query = { lastActivityAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }
                break
            case 'purchase_history':
                query = { 'orders.0': { $exists: true } }
                break
            case 'demographic':
                query = {}
                break
            case 'custom_rule':
                query = {}
                break
        }
        
        const count = await User.countDocuments(query)
        return Math.floor(count * 0.1) // Rough estimate
    } catch (error) {
        return 0
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
                // Apply custom rules
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
